import type { DateTime } from "luxon";
import { PAGE_SIZE } from "./constants";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const productListSelect = `
    product_id,
    name,
    description,
    upvotes:stats->>upvotes,
    views:stats->>views,
    reviews:stats->>reviews
`

export const productListTaglineSelect = `
    product_id,
    name,
    tagline,
    upvotes:stats->>upvotes,
    views:stats->>views,
    reviews:stats->>reviews
`

export const getProductsByDateRange = async (
    client: SupabaseClient<Database>, {
        startDate,
        endDate,
        limit,
        page = 1,
    }: {
        startDate: DateTime;
        endDate: DateTime;
        limit: number;
        page?: number;
    }
) => {
    const {data, error} = await client
        .from("products")
        .select(productListSelect)
        .order("stats->>upvotes", { ascending: false })
        .gte("created_at", startDate.toISO())
        .lte("created_at", endDate.toISO())
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    
    if (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
    }    
    return data;
};


export const getProductPagesByDateRange = async (
    client: SupabaseClient<Database>, {
        startDate,
        endDate,
    }: {    
        startDate: DateTime;
        endDate: DateTime;
    }
) => { 
    const {count, error} = await client
        .from("products")
        .select(`product_id`, {count: "exact", head: true})        
        .gte("created_at", startDate.toISO())
        .lte("created_at", endDate.toISO());
    if (error) {
        console.error("Error fetching product count:", error);
        throw new Error("Failed to fetch product count");
    }

    if (!count) {
        console.error("Count is null, no products found in the given date range.");
        return 1;
    }

    return Math.ceil(count / PAGE_SIZE);        
};

export const getCategories = async (
    client: SupabaseClient<Database>
) => {
    const { data, error } = await client
        .from("categories")
        .select(`
            category_id,
            name,
            description
        `);

    if (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Failed to fetch categories");
    }
    
    return data;
}

export const getCategory = async (
    client: SupabaseClient<Database>, 
    { categoryId }: { categoryId: number }
) => {
    const { data, error } = await client
        .from("categories")
        .select(`
            category_id,
            name,
            description
        `)
        .eq("category_id", categoryId)
        .single();

    if (error) {
        console.error("Error fetching category:", error);
        throw new Error("Failed to fetch category");
    }
    
    return data;
}

export const getProductsByCategory = async (
    client: SupabaseClient<Database>, {
        categoryId,
        page,
    }: {
        categoryId: number;
        page: number;
    }
) => {
    const { data, error } = await client
        .from("products")
        .select(productListSelect)
        .eq("category_id", categoryId)
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (error) {
        console.error("Error fetching products by category:", error);
        throw new Error("Failed to fetch products by category");
    }
    
    return data;
}

export const getCategoryPages = async (
    client: SupabaseClient<Database>, 
    { categoryId }: {categoryId: number}
) => {
    const { count, error } = await client
        .from("products")
        .select(`product_id`, { count: "exact", head: true })
        .eq("category_id", categoryId);

    if (error) {
        console.error("Error fetching category pages:", error);
        throw new Error("Failed to fetch category pages");
    }
    
    if (!count) return 1;
    return Math.ceil(count / PAGE_SIZE);
}

export const getProductsBySearch = async (
    client: SupabaseClient<Database>, {
        query,
        page,
    }: {
        query: string;
        page: number;
    }
) => {
    const { data, error } = await client
        .from("products")
        .select(productListTaglineSelect)
        .or(`name.ilike.%${query}%, tagline.ilike.%${query}%`)
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (error) {     
        console.error("Error fetching pages found:", error);
        throw new Error("Failed to fetch pages found");    
    }

    return data;
}

export const getPagesBySearch = async (
    client: SupabaseClient<Database>, 
    { query }: { query: string }
) => {
    const { count, error } = await client
        .from("products")
        .select(`product_id`, { count: "exact", head: true })
        .or(`name.ilike.%${query}%, tagline.ilike.%${query}%`);

    if (error) {     
        console.error("Error fetching pages count:", error);
        throw new Error("Failed to fetch pages count");    
    }

    if (!count) return 1;

    return Math.ceil(count / PAGE_SIZE);
}

export const getProductById = async (
    client: SupabaseClient<Database>, 
    { productId }: { productId: string }
) => {
    const { data, error } = await client
        .from("product_overview_view")
        .select("*")
        .eq("product_id", +productId)
        .single();

    if (error) {
        console.error("Error fetching products by id", error);
        throw new Error("Failed to fetch products by id");
    }

    return data;
}

export const getReviews = async (
    client: SupabaseClient<Database>, 
    { productId }:{ productId: string }
) => {
    const { data, error } = await client
        .from("reviews")
        .select(`
            review_id,
            rating,
            review,            
            created_at,
            user:profiles!inner(
                name, username, avatar
            )            
        `)
        .eq("product_id", +productId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch reviews: ", error);
        throw new Error("Failed to fetch reviews");
    }

    return data;
}

export const getPromotions = async (client: SupabaseClient<Database>) => {
    const { data, error } = await client
        .from("products")
        .select(`
            name,
            description   
        `)        
        .order("name", { ascending: true });

    if (error) {
        console.error("Failed to fetch reviews: ", error);
        throw new Error("Failed to fetch reviews");
    }

    return data;
}