import {
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const crowdLevelEnum = pgEnum("crowd_level", ["low", "moderate", "high", "critical"])
export const advisorySeverityEnum = pgEnum("advisory_severity", ["info", "warning", "urgent"])

export const attractions = pgTable("attractions", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  district: text("district").notNull(),
  location: text("location").notNull(),
  openingHours: text("opening_hours").notNull(),
  tags: text("tags").array().notNull().default([]),
  baselineCrowd: crowdLevelEnum("baseline_crowd").notNull().default("moderate"),
  carFreeHint: text("car_free_hint").notNull(),
  wasteReminder: text("waste_reminder").notNull(),
  durationHours: numeric("duration_hours", { precision: 4, scale: 2 }).notNull().default("2"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const tourismEvents = pgTable("tourism_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  startsOn: date("starts_on", { mode: "string" }).notNull(),
  endsOn: date("ends_on", { mode: "string" }).notNull(),
  impact: crowdLevelEnum("impact").notNull().default("high"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const advisories = pgTable("advisories", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  severity: advisorySeverityEnum("severity").notNull().default("info"),
  area: text("area").notNull(),
  message: text("message").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const crowdRules = pgTable("crowd_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  condition: text("condition").notNull(),
  scoreImpact: integer("score_impact").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})
