import { describe, expect, it } from "vitest"

import { getCrowdLevel, scoreCrowdForDate } from "./crowd"
import type { TourismData } from "./types"

const tourismData: TourismData = {
  attractions: [],
  events: [
    {
      id: "panagbenga",
      name: "Panagbenga peak weekend",
      startsOn: "2026-02-21",
      endsOn: "2026-02-22",
      impact: "critical",
      notes: "Festival crowd pressure",
    },
  ],
  advisories: [],
  crowdRules: [],
}

describe("crowd scoring", () => {
  it("maps score thresholds to crowd levels", () => {
    expect(getCrowdLevel(10)).toBe("low")
    expect(getCrowdLevel(40)).toBe("moderate")
    expect(getCrowdLevel(65)).toBe("high")
    expect(getCrowdLevel(85)).toBe("critical")
  })

  it("raises crowd score for event dates and private-car pressure", () => {
    const crowd = scoreCrowdForDate(
      new Date("2026-02-21T00:00:00"),
      { transportMode: "private-car" },
      tourismData,
    )

    expect(crowd.level).toBe("critical")
    expect(crowd.score).toBe(100)
    expect(crowd.factors).toContain("Panagbenga peak weekend")
    expect(crowd.factors).toContain("Private-car pressure")
  })

  it("keeps weekday car-light plans below high demand when no event applies", () => {
    const crowd = scoreCrowdForDate(
      new Date("2026-02-24T00:00:00"),
      { transportMode: "no-private-car" },
      tourismData,
    )

    expect(crowd.level).toBe("low")
    expect(crowd.factors).toContain("Car-light plan")
  })
})
