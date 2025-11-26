import AdminLeaderboard from '@/components/admin/leaderboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/leaderboard/$roundId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roundId } = Route.useParams();
  return <AdminLeaderboard roundId={roundId} />
}
