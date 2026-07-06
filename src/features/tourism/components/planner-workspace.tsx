"use client"

import { useMemo, useState, useTransition } from "react"
import {
  BikeIcon,
  CalendarDaysIcon,
  CarIcon,
  CheckIcon,
  ExternalLinkIcon,
  LeafIcon,
  MapPinnedIcon,
  RouteIcon,
  TreesIcon,
  UtensilsIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { addDays, scoreCrowdForDate, toDateInputValue } from "@/features/tourism/crowd"
import { generateLocalItinerary, getDefaultItineraryRequest } from "@/features/tourism/itinerary"
import type {
  Attraction,
  BudgetLevel,
  CrowdLevel,
  ItineraryRequest,
  ItineraryResult,
  TourismData,
  TransportMode,
} from "@/features/tourism/types"

type PlannerWorkspaceProps = {
  initialData: TourismData
}

const interestOptions = [
  { label: "Nature", value: "nature", icon: LeafIcon },
  { label: "Parks", value: "parks", icon: TreesIcon },
  { label: "Food", value: "food", icon: UtensilsIcon },
  { label: "Culture", value: "culture", icon: MapPinnedIcon },
  { label: "Art", value: "art", icon: MapPinnedIcon },
  { label: "Budget", value: "budget", icon: CheckIcon },
]

const navItems = [
  { label: "Planner", href: "#planner", icon: RouteIcon },
  { label: "Attractions", href: "#attractions", icon: MapPinnedIcon },
  { label: "Crowd Outlook", href: "#crowd-outlook", icon: CalendarDaysIcon },
]

const crowdBadgeVariant: Record<CrowdLevel, "secondary" | "outline" | "destructive"> = {
  low: "secondary",
  moderate: "outline",
  high: "destructive",
  critical: "destructive",
}

export function PlannerWorkspace({ initialData }: PlannerWorkspaceProps) {
  const tourismData = initialData
  const [request, setRequest] = useState<ItineraryRequest>(getDefaultItineraryRequest())
  const [itinerary, setItinerary] = useState<ItineraryResult>(() =>
    generateLocalItinerary(getDefaultItineraryRequest(), initialData),
  )
  const [isPending, startTransition] = useTransition()

  const crowdForecast = useMemo(() => {
    const start = new Date(`${request.startDate}T00:00:00`)

    return Array.from({ length: 5 }, (_, index) => {
      const date = addDays(start, index)
      const crowd = scoreCrowdForDate(date, request, tourismData)

      return {
        dateValue: toDateInputValue(date),
        ...crowd,
      }
    })
  }, [request, tourismData])

  const sourceBackedEvents = useMemo(() => {
    return tourismData.events.filter((event) => event.sourceName).slice(0, 6)
  }, [tourismData.events])

  function updateRequest(patch: Partial<ItineraryRequest>) {
    setRequest((current) => ({ ...current, ...patch }))
  }

  function planTrip() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          throw new Error(`Planner API failed with status ${response.status}`)
        }

        const result = (await response.json()) as ItineraryResult
        setItinerary(result)
        toast.success("Itinerary ready")
      } catch (error) {
        const result = generateLocalItinerary(request, tourismData)
        setItinerary(result)
        toast.warning(error instanceof Error ? error.message : "Using saved planning rules")
      }
    })
  }

  function toggleInterest(value: string) {
    setRequest((current) => {
      const interests = current.interests.includes(value)
        ? current.interests.filter((interest) => interest !== value)
        : [...current.interests, value]

      return {
        ...current,
        interests: interests.length ? interests : current.interests,
      }
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LeafIcon className="size-5" />
            </div>
            <div>
              <p className="font-heading text-xl font-semibold">Breathe Baguio</p>
              <p className="text-sm text-muted-foreground">Responsible trip planner</p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto text-sm" aria-label="Primary sections">
            {navItems.map(({ href, icon: Icon, label }) => (
              <a
                className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                href={href}
                key={href}
              >
                <Icon className="size-4" />
                {label}
              </a>
            ))}
          </nav>

          <p className="hidden items-center gap-2 text-sm text-muted-foreground xl:flex">
            <LeafIcon className="size-4 text-primary" />
            Travel light. Leave no trace.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 lg:px-8">
        <section className="grid gap-6" id="planner">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-semibold tracking-normal text-balance md:text-5xl">
              Plan a lighter Baguio trip
            </h1>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Build a simple itinerary with crowd signals, car-light guidance, and low-waste reminders.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[27rem_1fr]">
            <PlannerForm
              isPending={isPending}
              request={request}
              onPlan={planTrip}
              onInterestToggle={toggleInterest}
              onUpdate={updateRequest}
            />
            <PlanPreview itinerary={itinerary} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr]" id="crowd-outlook">
          <CrowdOutlook forecast={crowdForecast} />
          <SimpleGuidance
            icon={CarIcon}
            title="Leave the car"
            items={itinerary.carFreeSuggestions.slice(0, 3)}
          />
          <SimpleGuidance
            icon={LeafIcon}
            title="Low-waste reminders"
            items={itinerary.ecoReminders.slice(0, 3)}
          />
        </section>

        <section className="grid gap-4" id="attractions">
          <SectionHeader
            title="Attractions"
            description="Source-backed starter records. Use the admin workspace to curate official updates."
          />
          <AttractionsGrid attractions={tourismData.attractions} />
        </section>

        <section className="grid gap-4 pb-8">
          <SectionHeader
            title="Calendar signals"
            description="Holiday and Panagbenga pressure windows used by the crowd score."
          />
          <EventList events={sourceBackedEvents} />
        </section>
      </main>
    </div>
  )
}

function PlannerForm({
  isPending,
  request,
  onPlan,
  onInterestToggle,
  onUpdate,
}: {
  isPending: boolean
  request: ItineraryRequest
  onPlan: () => void
  onInterestToggle: (value: string) => void
  onUpdate: (patch: Partial<ItineraryRequest>) => void
}) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Trip details</CardTitle>
        <CardDescription>Tell us just enough to build the best route.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="notes">Trip prompt</FieldLabel>
            <Textarea
              id="notes"
              maxLength={160}
              onChange={(event) => onUpdate({ notes: event.target.value })}
              rows={3}
              value={request.notes}
            />
            <FieldDescription>Example: 2-day Baguio trip, low budget, no private car.</FieldDescription>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="days">Days</FieldLabel>
              <Input
                id="days"
                max={5}
                min={1}
                onChange={(event) => onUpdate({ days: Number(event.target.value) })}
                type="number"
                value={request.days}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="startDate">Start date</FieldLabel>
              <Input
                id="startDate"
                onChange={(event) => onUpdate({ startDate: event.target.value })}
                type="date"
                value={request.startDate}
              />
            </Field>
          </div>

          <FieldSet>
            <FieldLegend>Budget</FieldLegend>
            <ToggleGroup
              className="grid grid-cols-3"
              onValueChange={(value) => onUpdate({ budget: (value.at(-1) || request.budget) as BudgetLevel })}
              value={[request.budget]}
            >
              <ToggleGroupItem value="low">Low</ToggleGroupItem>
              <ToggleGroupItem value="mid">Mid</ToggleGroupItem>
              <ToggleGroupItem value="premium">Premium</ToggleGroupItem>
            </ToggleGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Transport</FieldLegend>
            <ToggleGroup
              className="grid grid-cols-1 sm:grid-cols-3"
              onValueChange={(value) =>
                onUpdate({ transportMode: (value.at(-1) || request.transportMode) as TransportMode })
              }
              value={[request.transportMode]}
            >
              <ToggleGroupItem value="no-private-car">
                <BikeIcon data-icon="inline-start" />
                No private car
              </ToggleGroupItem>
              <ToggleGroupItem value="mixed">Mixed</ToggleGroupItem>
              <ToggleGroupItem value="private-car">
                <CarIcon data-icon="inline-start" />
                Private car
              </ToggleGroupItem>
            </ToggleGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Interests</FieldLegend>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(({ icon: Icon, label, value }) => (
                <Button
                  key={value}
                  onClick={() => onInterestToggle(value)}
                  type="button"
                  variant={request.interests.includes(value) ? "secondary" : "outline"}
                >
                  <Icon data-icon="inline-start" />
                  {label}
                </Button>
              ))}
            </div>
          </FieldSet>

          <Button className="w-full" disabled={isPending} onClick={onPlan}>
            <RouteIcon data-icon="inline-start" />
            {isPending ? "Planning" : "Plan trip"}
          </Button>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

function PlanPreview({ itinerary }: { itinerary: ItineraryResult }) {
  const firstDay = itinerary.days[0]

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Your plan</CardTitle>
          <CardDescription>
            {itinerary.source === "openai" ? "Planner service" : "Planning rules"} preview
          </CardDescription>
        </div>
        <CardAction>
          <Badge variant="secondary">{firstDay?.crowdLevel ?? "low"} crowd</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2 rounded-lg border bg-muted/35 p-3">
          <p className="text-sm font-medium">{firstDay?.date ?? "Select a date"}</p>
          <p className="text-sm text-muted-foreground">{firstDay?.summary ?? itinerary.assumptions[0]}</p>
        </div>

        <div className="grid gap-3">
          {(firstDay?.stops ?? []).map((stop, index) => (
            <div className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3" key={`${stop.time}-${stop.title}`}>
              <p className="text-sm tabular-nums text-muted-foreground">{stop.time}</p>
              <div className="min-w-0">
                <p className="truncate font-medium">{stop.title}</p>
                <p className="truncate text-sm text-muted-foreground">{stop.district}</p>
              </div>
              <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                {index + 1}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="grid gap-2 sm:grid-cols-2">
          {itinerary.days.map((day) => (
            <div className="rounded-lg border p-3" key={day.date}>
              <p className="text-sm font-medium">Day {day.day}</p>
              <p className="text-xs text-muted-foreground">
                {day.crowdScore}/100 · {day.crowdLevel}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CrowdOutlook({
  forecast,
}: {
  forecast: Array<{
    dateValue: string
    level: CrowdLevel
    score: number
    factors: string[]
  }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crowd outlook</CardTitle>
        <CardDescription>Next 5 days from your start date.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {forecast.map((day) => (
          <div className="grid gap-2" key={day.dateValue}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{day.dateValue}</p>
              <Badge variant={crowdBadgeVariant[day.level]}>{day.level}</Badge>
            </div>
            <Progress value={day.score}>
              <ProgressLabel>{day.score}/100</ProgressLabel>
            </Progress>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function SimpleGuidance({
  icon: Icon,
  items,
  title,
}: {
  icon: typeof LeafIcon
  items: string[]
  title: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 text-sm text-muted-foreground">
          {items.map((item) => (
            <li className="grid grid-cols-[1rem_1fr] gap-2" key={item}>
              <CheckIcon className="mt-0.5 size-4 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function SectionHeader({ description, title }: { description: string; title: string }) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold tracking-normal">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function AttractionsGrid({ attractions }: { attractions: Attraction[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {attractions.slice(0, 6).map((attraction) => (
        <Card key={attraction.id}>
          <CardHeader>
            <div>
              <CardTitle className="text-base">{attraction.name}</CardTitle>
              <CardDescription>{attraction.location}</CardDescription>
            </div>
            <CardAction>
              <Badge variant={crowdBadgeVariant[attraction.baselineCrowd]}>{attraction.baselineCrowd}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap gap-1.5">
              {attraction.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{attraction.carFreeHint}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a
                className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                href={mapSearchUrl(attraction)}
                rel="noreferrer"
                target="_blank"
              >
                Open map
                <ExternalLinkIcon className="size-3.5" />
              </a>
              {attraction.sourceUrl && (
                <a
                  className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                  href={attraction.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Source
                  <ExternalLinkIcon className="size-3.5" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EventList({ events }: { events: TourismData["events"] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id}>
          <CardContent className="grid gap-3 p-4">
          <a
            className="grid gap-3"
            href={event.sourceUrl || "#"}
            rel="noreferrer"
            target={event.sourceUrl ? "_blank" : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {event.startsOn}
                {event.startsOn !== event.endsOn ? ` to ${event.endsOn}` : ""}
              </p>
              <Badge className="shrink-0" variant={crowdBadgeVariant[event.impact]}>
                {event.impact}
              </Badge>
            </div>
            <p className="font-medium">{event.name}</p>
            <p className="text-sm text-muted-foreground">{event.notes}</p>
          </a>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function mapSearchUrl(attraction: Attraction) {
  const query = encodeURIComponent(`${attraction.name}, ${attraction.location}, Baguio City, Philippines`)

  return `https://www.google.com/maps/search/?api=1&query=${query}`
}
