import {
  date,
  index,
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
export const userRoleEnum = pgEnum("user_role", ["admin", "traveler"])

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id").primaryKey(),
    role: userRoleEnum("role").notNull().default("traveler"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("user_roles_role_idx").on(table.role)],
)

export const attractions = pgTable(
  "attractions",
  {
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
    sourceName: text("source_name"),
    sourceUrl: text("source_url"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("attractions_created_at_name_idx").on(table.createdAt, table.name)],
)

export const tourismEvents = pgTable(
  "tourism_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    startsOn: date("starts_on", { mode: "string" }).notNull(),
    endsOn: date("ends_on", { mode: "string" }).notNull(),
    impact: crowdLevelEnum("impact").notNull().default("high"),
    notes: text("notes").notNull().default(""),
    sourceName: text("source_name"),
    sourceUrl: text("source_url"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("tourism_events_starts_on_name_idx").on(table.startsOn, table.name)],
)

export const advisories = pgTable(
  "advisories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    severity: advisorySeverityEnum("severity").notNull().default("info"),
    area: text("area").notNull(),
    message: text("message").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    sourceName: text("source_name"),
    sourceUrl: text("source_url"),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("advisories_created_at_title_idx").on(table.createdAt, table.title)],
)

export const crowdRules = pgTable(
  "crowd_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    label: text("label").notNull(),
    condition: text("condition").notNull(),
    scoreImpact: integer("score_impact").notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("crowd_rules_created_at_label_idx").on(table.createdAt, table.label)],
)
