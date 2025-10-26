import { 
    createBrowserClient, 
    createServerClient, 
    parseCookieHeader,
    serializeCookieHeader,     
} from "@supabase/ssr"
import type { MergeDeep, SetFieldType, SetNonNullable } from 'type-fest';
import type { Database as SupabaseDatabase } from "@db";
import { createClient } from "@supabase/supabase-js";


export type Database = MergeDeep<
    SupabaseDatabase, {
        public: {
            Views: {
                messages_view: {
                    Row: SetNonNullable<
                        SupabaseDatabase['public']['Views']['messages_view']['Row']
                    >;
                };
                community_post_list_view: {
                    Row: SetFieldType<
                        SetNonNullable<
                            SupabaseDatabase['public']['Views']['community_post_list_view']['Row']
                        >,
                        "author_avatar",
                        string | null
                    >;                    
                };
                product_overview_view: {
                    Row: SetNonNullable<
                        SupabaseDatabase["public"]["Views"]["product_overview_view"]["Row"]
                    >;    
                };
                community_post_detail: {
                    Row: SetNonNullable<
                        SupabaseDatabase["public"]["Views"]["community_post_detail"]["Row"]
                    >;
                };
                gpt_ideas_view: {
                    Row: SetNonNullable<
                        SupabaseDatabase['public']['Views']['gpt_ideas_view']['Row']
                    >;
                };
            };
        };
    }
>;

export const browserClient = createBrowserClient<Database>(
    "https://grrdfwoopwewsdgtzlgw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycmRmd29vcHdld3NkZ3R6bGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NjYxNTQsImV4cCI6MjA2MTE0MjE1NH0.d8p3_sqQZ_1faXNBKzjZDiBogiGAOAnJXWMXPnYO8aM",
);

export const makeSSRClient = (request: Request) => {
    const headers = new Headers();
    const serverSideClient = createServerClient<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {    
            cookies: {
                getAll() {                    
                    const cookies = parseCookieHeader(request.headers.get("Cookie") ?? "");
                    return cookies
                        ? cookies.map(({ name, value }) => ({
                            name,
                            value: value ?? ""
                        }))
                        : [];
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        headers.append(
                            "Set-Cookie",
                            serializeCookieHeader(name, value, options)
                        );
                    });
                },
            },
        },
    );

    return {
        client: serverSideClient,
        headers,
    };
};


export const adminClient = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
);

