import type React from "react"
import { AuthStatusBar } from "@/components/auth-status-bar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthStatusBar />
      {children}
    </div>
  )
}
