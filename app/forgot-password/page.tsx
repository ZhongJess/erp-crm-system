'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsLoading(false)
    setSubmitted(true)
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
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-8">
          {submitted ? (
            // Success state
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">重設信件已發送</h2>
              <p className="text-sm text-muted-foreground mb-6">
                我們已傳送密碼重設連結至 <strong>{email}</strong>。
                請查看你的信箱，連結有效期限為 30 分鐘。
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                沒有收到？請確認垃圾郵件匣，或稍後再試。
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSubmitted(false)}
              >
                重新發送
              </Button>
              <Link
                href="/login"
                className="block text-sm text-blue-600 hover:underline mt-4"
              >
                返回登入
              </Link>
            </div>
          ) : (
            // Form state
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">忘記密碼</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  輸入你的帳號電子郵件，我們將寄送密碼重設連結。
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">電子郵件</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="mt-1"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !email}>
                  <Mail className="h-4 w-4 mr-2" />
                  {isLoading ? '發送中...' : '發送重設連結'}
                </Button>
              </form>

              <Link
                href="/login"
                className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                返回登入
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
