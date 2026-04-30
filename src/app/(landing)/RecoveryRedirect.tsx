'use client'

import { useEffect } from 'react'

export default function RecoveryRedirect() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hash = window.location.hash
    if (!hash.includes('access_token=') || !hash.includes('type=recovery')) return

    window.location.replace(`/auth/set-password${hash}`)
  }, [])

  return null
}
