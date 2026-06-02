'use client'
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import type { Group } from 'three'
import { Mesh } from 'three'

import type { AIState } from '@/lib/speech'

export function ReporterModel({ aiState = 'idle' }: { aiState?: AIState }) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF('/models/reporter.glb')
  const modelScene = useMemo(() => scene.clone(true), [scene])
  const { actions, mixer } = useAnimations(animations, group)
  const transform = useMemo(() => {
    const box = new THREE.Box3().setFromObject(modelScene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = size.y > 0 ? 2.65 / size.y : 1

    return {
      scale,
      position: [-center.x * scale, -center.y * scale - 0.12, -center.z * scale] as [number, number, number],
    }
  }, [modelScene])

  useEffect(() => {
    modelScene.traverse((child) => {
      if (child instanceof Mesh) {
        const meshMaterials = Array.isArray(child.material) ? child.material : [child.material]
        if (meshMaterials.some((material) => material?.name?.toLowerCase() === 'ground')) {
          child.visible = false
          return
        }

        child.castShadow = true
        child.receiveShadow = true

        child.material = meshMaterials.map((material) => {
          const source = material as THREE.MeshStandardMaterial
          const name = source?.name?.toLowerCase() ?? ''
          const color = getFallbackColor(name)
          const replacement = new THREE.MeshStandardMaterial({
            name: source?.name,
            color,
            roughness: name.includes('eyes') || name.includes('light') ? 0.22 : 0.58,
            metalness: name.includes('ring') || name.includes('light') ? 0.45 : 0.04,
            side: THREE.DoubleSide,
            transparent: name.includes('eyelash') || name.includes('tear') || name.includes('eyes_outer'),
            opacity: name.includes('tear') || name.includes('eyes_outer') ? 0.38 : 1,
            emissive: name.includes('light') ? new THREE.Color('#4fc3f7') : new THREE.Color('#000000'),
            emissiveIntensity: name.includes('light') ? 1.4 : 0,
          })

          replacement.envMapIntensity = 1
          return replacement
        })

        if (!Array.isArray(child.material)) child.material = child.material[0]
      }
    })
  }, [modelScene])

  useEffect(() => {
    if (animations.length > 0 && actions) {
      const idle = Object.values(actions)[0]
      if (idle) {
        idle.reset().play()
        idle.setEffectiveTimeScale(1)
      }
    }
  }, [actions, animations.length])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const isSpeaking = aiState === 'speaking'
    const speed = isSpeaking ? 1.8 : 0.5
    const amp = isSpeaking ? 0.06 : 0.03
    group.current.position.y = Math.sin(t * speed) * amp
    group.current.rotation.y = Math.sin(t * (isSpeaking ? 0.6 : 0.2)) * (isSpeaking ? 0.08 : 0.05)
  })

  useEffect(() => {
    return () => { if (mixer) mixer.stopAllAction() }
  }, [mixer])

  return (
    <group ref={group} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={modelScene} scale={transform.scale} position={transform.position} />
    </group>
  )
}

useGLTF.preload('/models/reporter.glb')

function getFallbackColor(name: string) {
  if (name.includes('body')) return '#c78d72'
  if (name.includes('cloth')) return '#27364a'
  if (name.includes('hair_inner')) return '#171412'
  if (name.includes('hair_outer')) return '#2b211c'
  if (name.includes('eyes_inner')) return '#26384f'
  if (name.includes('eyes_outer')) return '#e7f7ff'
  if (name.includes('eyelash')) return '#0f0f12'
  if (name.includes('ring')) return '#9aa8b7'
  if (name.includes('light')) return '#4fc3f7'
  if (name.includes('tear')) return '#bdefff'
  return '#8f98a3'
}
