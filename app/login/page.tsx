'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setPasswordError('')

    if (!email && !password) {
      setEmailError('請輸入電子郵件')
      setPasswordError('請輸入密碼')
      return
    }
    if (!email) {
      setEmailError('請輸入電子郵件')
      return
    }
    if (!password) {
      setPasswordError('請輸入密碼')
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))
    setIsLoading(false)

    // Demo: redirect to dashboard
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary mb-4">
            <span className="text-primary-foreground font-bold text-lg">E</span>
          </div>
          <h1 className="text-2xl font-bold">ERP</h1>
          <p className="text-sm text-muted-foreground mt-1">企業資源規劃系統</p>
        </div>

        {/* Card */}
        <div className="bg-card border rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">登入帳號</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                placeholder="name@company.com"
                autoComplete="email"
                className={`mt-1 ${emailError ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
              />
              {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密碼</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  忘記密碼？
                </Link>
              </div>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                  placeholder="輸入密碼"
                  autoComplete="current-password"
                  className={passwordError ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-xs text-destructive">{passwordError}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(!!v)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                記住我（30 天）
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? '登入中...' : '登入'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 ERP System. All rights reserved.
        </p>
      </div>
    </div>
  )
}
