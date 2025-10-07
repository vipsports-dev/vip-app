// app/layout.tsx
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import SiteHeader from '@/components/navigation/SiteHeader'
import SiteFooter from '@/components/footer/SiteFooter'

export const metadata = {
  title: 'VIP Sports App',
  description: 'Your contests and rewards hub',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteHeader />
        {children}
        <SiteFooter />
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  )
}
