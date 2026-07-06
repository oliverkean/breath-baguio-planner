import "server-only"

import { desc } from "drizzle-orm"

import { advisories, attractions, crowdRules, tourismEvents } from "@/db/schema"
import { getDb } from "@/lib/db"
import { tourismData } from "./data"
import type { Advisory, Attraction, CrowdRule, TourismData, TourismEvent } from "./types"

type AttractionInput = Omit<Attraction, "id">
type TourismEventInput = Omit<TourismEvent, "id">
type AdvisoryInput = Omit<Advisory, "id">
type CrowdRuleInput = Omit<CrowdRule, "id">

export async function getTourismData(): Promise<TourismData> {
  const db = getDb()

  if (!db) {
    return tourismData
  }

  try {
    const [attractionRows, eventRows, advisoryRows, crowdRuleRows] = await Promise.all([
      db.select().from(attractions).orderBy(desc(attractions.createdAt), attractions.name),
      db.select().from(tourismEvents).orderBy(tourismEvents.startsOn, tourismEvents.name),
      db.select().from(advisories).orderBy(desc(advisories.createdAt), advisories.title),
      db.select().from(crowdRules).orderBy(desc(crowdRules.createdAt), crowdRules.label),
    ])

    if (!attractionRows.length && !eventRows.length && !advisoryRows.length && !crowdRuleRows.length) {
      return tourismData
    }

    return {
      attractions: attractionRows.length ? attractionRows.map(mapAttraction) : tourismData.attractions,
      events: eventRows.length ? eventRows.map(mapTourismEvent) : tourismData.events,
      advisories: advisoryRows.length ? advisoryRows.map(mapAdvisory) : tourismData.advisories,
      crowdRules: crowdRuleRows.length ? crowdRuleRows.map(mapCrowdRule) : tourismData.crowdRules,
    }
  } catch (error) {
    console.warn("Falling back to seed tourism data:", error)
    return tourismData
  }
}

export async function createAttraction(input: AttractionInput) {
  const db = requireDb()
  const [record] = await db
    .insert(attractions)
    .values({
      slug: uniqueSlug(input.name),
      name: input.name,
      district: input.district,
      location: input.location,
      openingHours: input.openingHours,
      tags: input.tags,
      baselineCrowd: input.baselineCrowd,
      carFreeHint: input.carFreeHint,
      wasteReminder: input.wasteReminder,
      durationHours: String(input.durationHours),
    })
    .returning()

  return mapAttraction(record)
}

export async function createTourismEvent(input: TourismEventInput) {
  const db = requireDb()
  const [record] = await db
    .insert(tourismEvents)
    .values({
      slug: uniqueSlug(`${input.name}-${input.startsOn}`),
      name: input.name,
      startsOn: input.startsOn,
      endsOn: input.endsOn,
      impact: input.impact,
      notes: input.notes,
    })
    .returning()

  return mapTourismEvent(record)
}

export async function createAdvisory(input: AdvisoryInput) {
  const db = requireDb()
  const [record] = await db
    .insert(advisories)
    .values({
      title: input.title,
      severity: input.severity,
      area: input.area,
      message: input.message,
    })
    .returning()

  return mapAdvisory(record)
}

export async function createCrowdRule(input: CrowdRuleInput) {
  const db = requireDb()
  const [record] = await db
    .insert(crowdRules)
    .values({
      label: input.label,
      condition: input.condition,
      scoreImpact: input.scoreImpact,
    })
    .returning()

  return mapCrowdRule(record)
}

function requireDb() {
  const db = getDb()

  if (!db) {
    throw new Error("DATABASE_URL is not configured.")
  }

  return db
}

function mapAttraction(row: typeof attractions.$inferSelect): Attraction {
  return {
    id: row.id,
    name: row.name,
    district: row.district,
    location: row.location,
    openingHours: row.openingHours,
    tags: row.tags ?? [],
    baselineCrowd: row.baselineCrowd,
    carFreeHint: row.carFreeHint,
    wasteReminder: row.wasteReminder,
    durationHours: Number(row.durationHours),
  }
}

function mapTourismEvent(row: typeof tourismEvents.$inferSelect): TourismEvent {
  return {
    id: row.id,
    name: row.name,
    startsOn: row.startsOn,
    endsOn: row.endsOn,
    impact: row.impact,
    notes: row.notes,
  }
}

function mapAdvisory(row: typeof advisories.$inferSelect): Advisory {
  return {
    id: row.id,
    title: row.title,
    severity: row.severity,
    area: row.area,
    message: row.message,
  }
}

function mapCrowdRule(row: typeof crowdRules.$inferSelect): CrowdRule {
  return {
    id: row.id,
    label: row.label,
    condition: row.condition,
    scoreImpact: row.scoreImpact,
  }
}

function uniqueSlug(value: string) {
  return `${slugify(value)}-${Date.now().toString(36)}`
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return slug || "tourism-record"
}
