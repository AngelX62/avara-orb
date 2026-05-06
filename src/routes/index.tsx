import { createFileRoute } from "@tanstack/react-router";
import { AvaraOrb } from "@/components/AvaraOrb";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Avara — AI Command Assistant for Avitus" },
      {
        name: "description",
        content:
          "Avara is the AI command assistant inside Avitus — understand your pipeline, prepare the next action, and follow up with clarity.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="avara-stage">
      <div className="avara-vignette" aria-hidden />
      <div className="avara-center">
        <AvaraOrb size={340} />
        <div className="avara-wordmark">
          <span>A V A R A</span>
          <small>AI command assistant · Avitus</small>
        </div>
      </div>
    </main>
  );
}
