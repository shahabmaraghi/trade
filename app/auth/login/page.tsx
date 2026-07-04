import AuthLayout from "@/components/auth/auth-layout"
import LoginForm from "@/components/auth/login-form"
import { verifyToken } from "@/lib/auth"
import { User } from "@/models"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function LoginPage() {

  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (token) {
    const decoded = await verifyToken(token)
    if (decoded) {
      const user = await User.findById(decoded.id).select("-password")
      if (user) {
        redirect('/user')
      }
    }
  }

  return (
    <AuthLayout title="ورود به حساب کاربری">
      <LoginForm />
    </AuthLayout>
  )
}
