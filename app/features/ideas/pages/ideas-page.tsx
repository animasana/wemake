import { Hero } from "~/common/components/hero";
import IdeaCard from "../components/idea-card";
import type { Route } from "./+types/ideas-page";
import { getGptIdeas } from "../queries";
import { makeSSRClient } from "~/supa-client";

export function meta() {
  return [
    { title: "IdeasGPT | WeMake" },
    { name: "description", content: "Browse and submit product ideas" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const ideas = await getGptIdeas(client, { limit: 100 });
  return { ideas };
}

export default function IdeasPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-20">
      <Hero 
        title="IdeasGPT"
        subtitle="Find ideas for your next project"
      />
      <div className="grid grid-cols-4 gap-4">
        {loaderData.ideas.map((idea) => (
          <IdeaCard
            key={idea.gpt_idea_id}
            id={idea.gpt_idea_id}
            title={idea.idea}
            viewsCount={idea.views}
            postedAt={idea.created_at}
            likesCount={idea.likes}
            claimed={idea.is_claimed}
          />
        ))}
      </div>
    </div>
  );
}