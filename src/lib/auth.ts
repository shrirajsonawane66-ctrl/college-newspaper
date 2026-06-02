import { supabase } from './supabase'

export interface Profile {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'author'
  created_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as Profile
}

export async function ensureProfile(userId: string, email: string, name?: string): Promise<Profile | null> {
  const existing = await getProfile(userId)
  if (existing) return existing

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      name: name || email?.split('@')[0] || 'User',
      role: 'user',
    })
    .select()
    .single()

  if (error) {
    return null
  }

  return data as Profile
}
