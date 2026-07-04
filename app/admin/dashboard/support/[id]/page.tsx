import AdminTicketDetail from "@/components/admin/support/ticket-detail"

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminTicketDetail id={(await params).id} />
}
