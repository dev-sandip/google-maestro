import RoundPage from "@/components/dashboard/round";
import { ProtectionProvider } from "@/providers/protection-provider";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@google-maestro-new/backend/convex/_generated/api";
import type { Id } from "@google-maestro-new/backend/convex/_generated/dataModel";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/user/round/$roundId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { roundId } = Route.useParams();
  const questionQuery = useSuspenseQuery(
    convexQuery(api.questions.getQuestionByRoundID, {
      roundId: roundId as Id<"rounds">,
    })
  );
  const questions = questionQuery.data;
  return (
    <ProtectionProvider roundId={roundId as Id<'rounds'>} >
      <RoundPage questions={questions} />
    </ProtectionProvider>
  );
}
