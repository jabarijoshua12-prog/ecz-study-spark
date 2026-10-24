import { createFileRoute } from "@tanstack/react-router";
import { StudyApp } from "@/components/study-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ECZ Study — Daily exam drills" },
      { name: "description", content: "Two subjects a day, 15 past-paper style questions each. Practise ECZ Maths, Physics, Chemistry and Biology." },
      { property: "og:title", content: "ECZ Study — Daily exam drills" },
      { property: "og:description", content: "Two subjects a day, 15 past-paper style questions each. Practise ECZ Maths, Physics, Chemistry and Biology." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <StudyApp />;
}
