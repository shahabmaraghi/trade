import TicketDetail from "@/components/user/support/ticket-detail"

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <TicketDetail id={(await params).id} />
}
