CREATE TABLE "blackout_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"label" text NOT NULL,
	"room" "room",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
