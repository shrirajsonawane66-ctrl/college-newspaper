'use client'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { ContactShadows, Environment } from '@react-three/drei'
import { ReporterModel } from './ReporterModel'
import type { AIState } from '@/lib/speech'

function Scene({ aiState }: { aiState: AIState }) {
  return (
    <>
      <ambientLight intensity={1.35} />
      <hemisphereLight args={['#ffffff', '#d8c6a2', 1.5]} />
      <directionalLight position={[3, 4, 4]} intensity={2.4} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.85} />
      <pointLight position={[0, 2.5, 3]} intensity={1.2} color="#ffffff" />
      <Environment preset="city" />
      <ReporterModel aiState={aiState} />
      <ContactShadows
        position={[0, -1.47, 0]}
        opacity={0.2}
        scale={2.5}
        blur={2}
        far={2}
      />
    </>
  )
}

export function ReporterCanvas({ aiState = 'idle' }: { aiState?: AIState }) {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 4.1], fov: 32 }}
      dpr={[1, 2]}
      shadows="percentage"
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      onCreated={(state) => {
        state.gl.setClearColor(0x000000, 0)
        state.gl.toneMapping = THREE.ACESFilmicToneMapping
        state.gl.toneMappingExposure = 1.18
        state.gl.outputColorSpace = THREE.SRGBColorSpace
      }}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    >
      <Suspense fallback={null}>
        <Scene aiState={aiState} />
      </Suspense>
    </Canvas>
  )
}
