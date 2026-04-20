'use client'

import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center max-w-md px-6">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-muted mb-6">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">找不到此頁面</h2>
        <p className="text-muted-foreground mb-8">
          你所尋找的頁面不存在，或已被移除。請確認網址是否正確，或返回首頁。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              回到首頁
            </Link>
          </Button>
          <Button variant="outline" onClick={() => history.back()}>
            上一頁
          </Button>
        </div>
      </div>
    </div>
  )
}
