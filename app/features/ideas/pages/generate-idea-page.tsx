import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod"
import z from "zod";
import { insertIdeas } from "../mutations";
import { adminClient } from "~/supa-client";
import type { Route } from "./+types/generate-idea-page";

const openai = new OpenAI();

const IdeaSchema = z.object({
    title: z.string(),
    description: z.string().max(20),
    problem: z.string(),
    solution: z.string(),
    category: z.enum([
        "tech",
        "business",
        "health",
        "education",
        "finance",
        "other",
    ]),
});

const ResponseSchema = z.object({
    potato: z.array(IdeaSchema).length(10),
})

export const action = async ({ request }: Route.ActionArgs) => {
    if (request.method !== "POST") {
        return new Response(null, { status: 404 });
    }
    const header = request.headers.get("X-POTATO");
    if (!header || header !== "Y-POTATO") {
        return new Response(null, { status: 404 });
    }

    const completion = await openai.chat.completions.parse({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: "Give me the name and elevator pitch of startup ideas that can be built by small teams.",
            },
            {
                role: "user",
                content: "For example: 'An app that helps you find the best deals on groceries.' or 'A platform to rent a coder per hour.'"
            }
        ],
        response_format: zodResponseFormat(ResponseSchema, "potato"),
    });
    const descriptions = completion.choices[0].message.parsed?.potato.map(
        (idea) => idea.description
    );
    
    if (!descriptions) {
        return Response.json(
            {
                error: "No ideas generated",
            },
            { status: 400 }
        );
    }
    await insertIdeas(adminClient, descriptions);    
    return Response.json({
        ok: true,
    });
};