import { 
    boolean,
    bigint,
    jsonb, 
    pgEnum, 
    pgSchema, 
    pgTable, 
    primaryKey, 
    text, 
    timestamp, 
    uuid, 
    pgPolicy
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid, authUsers } from "drizzle-orm/supabase";
import { products } from "../products/schema";
import { posts } from "../community/schema";
import { sql } from "drizzle-orm";

export const roles = pgEnum("roles", [
    "developer", 
    "designer",
    "marketer",
    "founder",
    "product-manager",
]);

export const profiles = pgTable("profiles", {
    profile_id: uuid().primaryKey().references(() => authUsers.id),    
    avatar: text(),
    name: text().notNull(),
    username: text().notNull(),
    headline: text(),
    bio: text(),
    role: roles().default("developer").notNull(),
    stats: jsonb().$type<{
        followers: number;
        following: number;
    }>(),
    views: jsonb(),
    created_at: timestamp({withTimezone: true}).notNull().defaultNow(),
    updated_at: timestamp({withTimezone: true}).notNull().defaultNow(),
});


export const follows = pgTable("follows", {
    follower_id: uuid()
        .references(() => profiles.profile_id, {
            onDelete: "cascade"
        })
        .notNull(),
    following_id: uuid()
        .references(() => profiles.profile_id, {
            onDelete: "cascade"
        })
        .notNull(),
    created_at: timestamp().notNull().defaultNow(),
});

export const notificationTypes = pgEnum("notification_types", [
    "follow",
    "review",
    "reply",    
]);

export const notifications = pgTable("notifications", {
    notification_id: bigint({ mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    source_id: uuid().references(() => profiles.profile_id, {
        onDelete: "cascade",
    }),
    product_id: bigint({ mode: "number" }).references(() => products.product_id, {
        onDelete: "cascade",
    }),
    post_id: bigint({ mode: "number" }).references(() => posts.post_id, {
        onDelete: "cascade",
    }),
    target_id: uuid()
        .references(() => profiles.profile_id, {
            onDelete: "cascade",
        })
        .notNull(),  
    seen: boolean().default(false).notNull(),  
    type: notificationTypes().notNull(),
    created_at: timestamp().notNull().defaultNow(),
});

export const messageRooms = pgTable("message_rooms", {
    message_room_id: bigint({ mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    created_at: timestamp().notNull().defaultNow(),
});

export const messageRoomMembers = pgTable("message_room_members", {
    message_room_id: bigint({ mode: "number" }).references(() => 
    messageRooms.message_room_id, {
        onDelete: "cascade",
    }),
    profile_id: uuid().references(() => profiles.profile_id, {
        onDelete: "cascade",
    }),
    created_at: timestamp().notNull().defaultNow(),
}, (table) => [
    primaryKey({ columns: [table.message_room_id, table.profile_id] }),
]);

export const messages = pgTable("messages", {
    message_id: bigint({ mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    message_room_id: bigint({ mode: "number" })
        .references(() => messageRooms.message_room_id, {
            onDelete: "cascade",        
        })
        .notNull(),
    sender_id: uuid().references(() => profiles.profile_id, {
            onDelete: "cascade",
        })
        .notNull(),
    content: text().notNull(),
    created_at: timestamp().notNull().defaultNow(),
});


export const todos = pgTable("todos", {
    todo_id: bigint({ mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    title: text().notNull(),
    completed: boolean().notNull().default(false),
    created_at: timestamp().notNull().defaultNow(),
    profile_id: uuid().references(() => profiles.profile_id, {
        onDelete: "cascade",
    }).notNull(),
}, (table) => [
    pgPolicy("todos-insert-policy", {
        for: "insert",
        to: authenticatedRole,
        as: "permissive",
        withCheck: sql`${authUid} = ${table.profile_id}`,
    }),
    pgPolicy("todos-slelect-policy", {
        for: "select",
        to: authenticatedRole,
        as: "permissive",
        using: sql`${authUid} = ${table.profile_id}`,
    }),
]);