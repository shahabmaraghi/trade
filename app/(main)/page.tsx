"use client"
// import { redirect } from "next/navigation"
import Home from "@/components/main/Home/Home"
import Counseling from "@/components/main/Counseling/Counseling"
import Educational from "@/components/main/Educational/Educational"
import TeamMembers from "@/components/main/TeamMembers"
import Queries from "@/components/main/Queries"
import ProjectReviewForm from "@/components/main/ProjectReviewForm"
import Footer from "@/components/main/Footer"

// export default function HomePage() {
//   return redirect("/auth/login")
// }


export default function HomePage() {
  return <>
    <Home />
    <section id="counseling">
      <Counseling />
    </section>
    <Educational />
    <TeamMembers />
    <Queries />
    <section id="projectreview">
      <ProjectReviewForm />
    </section>
    <Footer />
  </>
}
