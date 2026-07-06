import { config } from "dotenv"
import { and, eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { advisories, attractions, crowdRules, tourismEvents } from "../src/db/schema"
import { tourismData } from "../src/features/tourism/data"

config({ path: ".env.local" })
config()

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed tourism data.")
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  })
  const db = drizzle(pool)

  await db.delete(tourismEvents).where(eq(tourismEvents.slug, "sample-long-weekend"))

  for (const attraction of tourismData.attractions) {
    await db
      .insert(attractions)
      .values({
        slug: attraction.id,
        name: attraction.name,
        district: attraction.district,
        location: attraction.location,
        openingHours: attraction.openingHours,
        tags: attraction.tags,
        baselineCrowd: attraction.baselineCrowd,
        carFreeHint: attraction.carFreeHint,
        wasteReminder: attraction.wasteReminder,
        durationHours: String(attraction.durationHours),
        sourceName: attraction.sourceName,
        sourceUrl: attraction.sourceUrl,
      })
      .onConflictDoUpdate({
        target: attractions.slug,
        set: {
          name: attraction.name,
          district: attraction.district,
          location: attraction.location,
          openingHours: attraction.openingHours,
          tags: attraction.tags,
          baselineCrowd: attraction.baselineCrowd,
          carFreeHint: attraction.carFreeHint,
          wasteReminder: attraction.wasteReminder,
          durationHours: String(attraction.durationHours),
          sourceName: attraction.sourceName,
          sourceUrl: attraction.sourceUrl,
          updatedAt: new Date(),
        },
      })
  }

  for (const event of tourismData.events) {
    await db
      .insert(tourismEvents)
      .values({
        slug: event.id,
        name: event.name,
        startsOn: event.startsOn,
        endsOn: event.endsOn,
        impact: event.impact,
        notes: event.notes,
        sourceName: event.sourceName,
        sourceUrl: event.sourceUrl,
      })
      .onConflictDoUpdate({
        target: tourismEvents.slug,
        set: {
          name: event.name,
          startsOn: event.startsOn,
          endsOn: event.endsOn,
          impact: event.impact,
          notes: event.notes,
          sourceName: event.sourceName,
          sourceUrl: event.sourceUrl,
          updatedAt: new Date(),
        },
      })
  }

  for (const advisory of tourismData.advisories) {
    const existing = await db
      .select({ id: advisories.id })
      .from(advisories)
      .where(and(eq(advisories.title, advisory.title), eq(advisories.area, advisory.area)))
      .limit(1)

    if (!existing.length) {
      await db.insert(advisories).values({
        title: advisory.title,
        severity: advisory.severity,
        area: advisory.area,
        message: advisory.message,
        sourceName: advisory.sourceName,
        sourceUrl: advisory.sourceUrl,
      })
    } else {
      await db
        .update(advisories)
        .set({
          severity: advisory.severity,
          message: advisory.message,
          sourceName: advisory.sourceName,
          sourceUrl: advisory.sourceUrl,
          updatedAt: new Date(),
        })
        .where(eq(advisories.id, existing[0].id))
    }
  }

  for (const rule of tourismData.crowdRules) {
    const existing = await db
      .select({ id: crowdRules.id })
      .from(crowdRules)
      .where(and(eq(crowdRules.label, rule.label), eq(crowdRules.condition, rule.condition)))
      .limit(1)

    if (!existing.length) {
      await db.insert(crowdRules).values({
        label: rule.label,
        condition: rule.condition,
        scoreImpact: rule.scoreImpact,
      })
    }
  }

  await pool.end()
  console.log("Seeded tourism data.")
}

main().catch(async (error) => {
  console.error(error)
  process.exitCode = 1
})
