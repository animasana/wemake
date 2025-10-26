import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const getTeams = async (
    client: SupabaseClient<Database>,
    { limit }: { limit: number }
) => {
    const { data, error } = await client.from("teams").select(`
        team_id,
        roles,
        product_description,
        team_leader:profiles!inner(
            username,
            avatar
        )
    `)
    .limit(limit);

    if (error) {
        console.error("Error fetching Teams:", error);
        throw new Error("Failed to fetch Teams");
    }

    return data;
};


export const getTeamById = async (
    client: SupabaseClient<Database>,
    { teamId }: { teamId: string }
) => {
    const { data, error } = await client
        .from("teams")
        .select(`
            *,
            team_leader:profiles!inner(
                name, 
                avatar, 
                role,
                username
            )
        `)
        .eq("team_id", parseInt(teamId))
        .single();

    if (error) {
        console.error("Error fetching Team:", error);
        throw new Error("Failed to fetch Team");
    }

    return data;
}