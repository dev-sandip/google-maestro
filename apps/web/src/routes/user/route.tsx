import { UnauthorizedAccess } from '@/components/unauthorized-acess'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'

export const Route = createFileRoute('/user')({
  component: RouteComponent,
})

function RouteComponent() {

  return <>
    <Authenticated>
      <Outlet />
    </Authenticated>
    <Unauthenticated>
      <UnauthorizedAccess type="GUEST" />
    </Unauthenticated>
    <AuthLoading>
      <div>Loading...</div>
    </AuthLoading>

  </>
}
