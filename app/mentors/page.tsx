import { redirect } from "next/navigation"
import { getSession } from "@/lib/mentors/auth"
import { AuthForm } from "@/components/mentors/auth-form"

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect("/mentors/dashboard")
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <AuthForm />
    </main>
  )
}
