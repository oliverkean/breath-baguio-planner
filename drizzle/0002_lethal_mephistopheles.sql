ALTER TABLE "advisories" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "advisories" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "attractions" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "attractions" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "crowd_rules" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "crowd_rules" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "tourism_events" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "tourism_events" ADD COLUMN "updated_by" uuid;