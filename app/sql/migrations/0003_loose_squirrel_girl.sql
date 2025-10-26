ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."notification_types";--> statement-breakpoint
CREATE TYPE "public"."notification_types" AS ENUM('follow', 'review', 'reply');--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."notification_types" USING "type"::"public"."notification_types";