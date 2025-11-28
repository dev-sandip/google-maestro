import { UserDashboard } from '@/components/dashboard/user-dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {

  return <UserDashboard />
}
