CREATE TYPE "public"."guestbook_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "guestbook_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_ref" text NOT NULL,
	"guest_name" text NOT NULL,
	"room" "room" NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"signoff" text DEFAULT '' NOT NULL,
	"image_urls" text DEFAULT '[]' NOT NULL,
	"status" "guestbook_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
