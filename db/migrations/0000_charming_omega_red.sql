CREATE TYPE "public"."room" AS ENUM('couch', 'bedroom');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'approved', 'declined');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" text NOT NULL,
	"name" text NOT NULL,
	"room" "room" NOT NULL,
	"arrive" text NOT NULL,
	"depart" text NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"why" text NOT NULL,
	"travel" text DEFAULT '' NOT NULL,
	"email" text,
	"calendar_event_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_ref_unique" UNIQUE("ref")
);
