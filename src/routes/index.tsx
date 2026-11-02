import { createFileRoute } from "@tanstack/react-router";
import { StudyApp } from "@/components/study-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARES — Daily ECZ Maths drills" },
      { name: "description", content: "15 past-paper style ECZ Maths questions a day across three topics, with a daily streak to keep you going." },
      { property: "og:title", content: "ARES — Daily ECZ Maths drills" },
      { property: "og:description", content: "15 past-paper style ECZ Maths questions a day across three topics, with a daily streak to keep you going." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <StudyApp />;
}
