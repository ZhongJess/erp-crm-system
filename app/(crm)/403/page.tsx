import Link from 'next/link'
import { ShieldX, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center max-w-md px-6">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6">
          <ShieldX className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-2">無存取權限</h2>
        <p className="text-muted-foreground mb-8">
          你的帳號角色目前沒有存取此頁面的權限。若有需要，請聯絡系統管理員調整你的角色權限。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              回到首頁
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">
              切換帳號
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
