import { createFileRoute } from "@tanstack/react-router";
import { StudyApp } from "@/components/study-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ECZ Study — Your personal study plan" },
      { name: "description", content: "Plan each study week, practise ECZ papers, and learn with a guided AI tutor." },
      { property: "og:title", content: "ECZ Study — Your personal study plan" },
      { property: "og:description", content: "Plan each study week, practise ECZ papers, and learn with a guided AI tutor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <StudyApp />;
}
