import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Appoint Funnels CRM — Cold email campaigns & client results" },
      {
        name: "description",
        content:
          "Appoint Funnels CRM: manage cold email campaigns, leads, replies, opportunities and client results in one compact workspace.",
      },
      { property: "og:title", content: "Appoint Funnels CRM" },
      {
        property: "og:description",
        content:
          "Agency workspace for cold email campaigns, lead management, unified inbox and client reporting.",
      },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
