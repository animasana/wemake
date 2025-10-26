import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const claimIdea = async (
    client: SupabaseClient<Database>,
    { ideaId, userId }: { ideaId: string; userId: string; }
) => {
    const { error } = await client
        .from("gpt_ideas")
        .update({ claimed_by: userId, claimed_at: new Date().toISOString() })
        .eq("gpt_idea_id", parseInt(ideaId));
    if (error) {
        throw error;
    }    
}

export const insertIdeas = async (
    client: SupabaseClient<Database>,
    ideas: string[]
) => {
    const { error } = await client
        .from("gpt_ideas")
        .insert(
            ideas.map((idea) => ({
                idea,
            }))
        );            
        
    if (error) {
        throw Error("Failed to insert ideas: " + error.message);
    }    
};