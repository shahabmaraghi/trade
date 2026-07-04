"use client"
import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthProvider } from "@/components/auth/AuthProvider"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Image src="/main/assets/images/Logo/Logo-replacement.png" alt="Tehran Chart" width={180} height={60} className="mx-auto" />
            </Link>
          </div>

          <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-center text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>

          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Plus Chart. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}
