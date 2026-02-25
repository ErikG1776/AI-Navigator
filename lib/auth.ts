import type { AuthError, Session, User } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

type AuthResult = {
  user: User | null
  session: Session | null
  error: AuthError | null
}

type SignUpOptions = {
  fullName?: string
  bio?: string
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return {
    user: data.user,
    session: data.session,
    error,
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  options: SignUpOptions = {}
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: options.fullName?.trim() || null,
        bio: options.bio?.trim() || null,
      },
    },
  })

  return {
    user: data.user,
    session: data.session,
    error,
  }
}

export async function signOutUser(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut()
  return { error }
}
