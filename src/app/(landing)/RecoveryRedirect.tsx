'use client'

import { useEffect } from 'react'

export default function RecoveryRedirect() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hash = window.location.hash
    const isPasswordFlow =
      hash.includes('type=recovery') ||
      hash.includes('type=invite') ||
      hash.includes('type=signup')

    if (!hash.includes('access_token=') || !isPasswordFlow) return

    window.location.replace(`/auth/set-password${hash}`)
  }, [])

  return null
}
