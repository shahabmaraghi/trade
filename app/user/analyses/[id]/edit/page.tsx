import EditAnalysis from "@/components/user/analyses/edit-analysis"

export default async function EditAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditAnalysis id={(await params).id} />
}
