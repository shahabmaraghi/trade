import ProjectDetail from "@/components/admin/projects/project-detail"

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectDetail id={(await params).id} />
}
