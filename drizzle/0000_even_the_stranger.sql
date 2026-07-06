CREATE TYPE "public"."advisory_severity" AS ENUM('info', 'warning', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."crowd_level" AS ENUM('low', 'moderate', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "advisories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"severity" "advisory_severity" DEFAULT 'info' NOT NULL,
	"area" text NOT NULL,
	"message" text NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attractions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"district" text NOT NULL,
	"location" text NOT NULL,
	"opening_hours" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"baseline_crowd" "crowd_level" DEFAULT 'moderate' NOT NULL,
	"car_free_hint" text NOT NULL,
	"waste_reminder" text NOT NULL,
	"duration_hours" numeric(4, 2) DEFAULT '2' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attractions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "crowd_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"condition" text NOT NULL,
	"score_impact" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tourism_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"impact" "crowd_level" DEFAULT 'high' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tourism_events_slug_unique" UNIQUE("slug")
);
