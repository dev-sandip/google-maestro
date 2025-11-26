import { UnauthorizedAccess } from "@/components/unauthorized-acess";
import { api } from "@google-maestro-new/backend/convex/_generated/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});


function RouteComponent() {
  const convexUser = useQuery(api.users.current)
  //if the 
  if (convexUser?.role === 'USER') {
    return <UnauthorizedAccess type="FORBIDDEN" />
  }
  return (
    <div>
      <Authenticated>
        <Outlet />
      </Authenticated>
      <Unauthenticated>
        <UnauthorizedAccess type="GUEST" />
      </Unauthenticated>
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading>
    </div>
  );
}
