import type { Metadata } from "next"
import AnalysisDetail from "@/components/main/AnalysisDetail"

interface AnalysisPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AnalysisPageProps): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/analyses/${(await params).id}`)

    if (!response.ok) {
      throw new Error("Failed to fetch analysis")
    }

    const analysis = await response.json()

    // Strip HTML tags for the description meta tag
    const stripHtml = (html: string) => {
      return html.replace(/<[^>]*>?/gm, "")
    }

    return {
      title: `${analysis.title} | پلاس چارت`,
      description: stripHtml(analysis.description).substring(0, 160),
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "تحلیل | پلاس چارت",
      description: "مشاهده تحلیل های تخصصی بازار",
    }
  }
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  return <AnalysisDetail id={(await params).id} />
}
