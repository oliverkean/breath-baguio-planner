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
      })
      .onConflictDoNothing({ target: attractions.slug })
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
      })
      .onConflictDoNothing({ target: tourismEvents.slug })
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
      })
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
