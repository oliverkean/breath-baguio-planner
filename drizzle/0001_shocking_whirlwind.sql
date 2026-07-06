CREATE TYPE "public"."user_role" AS ENUM('admin', 'traveler');--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"role" "user_role" DEFAULT 'traveler' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_roles_role_idx" ON "user_roles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "advisories_created_at_title_idx" ON "advisories" USING btree ("created_at","title");--> statement-breakpoint
CREATE INDEX "attractions_created_at_name_idx" ON "attractions" USING btree ("created_at","name");--> statement-breakpoint
CREATE INDEX "crowd_rules_created_at_label_idx" ON "crowd_rules" USING btree ("created_at","label");--> statement-breakpoint
CREATE INDEX "tourism_events_starts_on_name_idx" ON "tourism_events" USING btree ("starts_on","name");