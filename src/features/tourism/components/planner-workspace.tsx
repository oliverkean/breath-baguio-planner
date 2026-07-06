"use client"

import { useMemo, useState, useTransition } from "react"
import {
  AlertTriangleIcon,
  BikeIcon,
  CalendarDaysIcon,
  CarIcon,
  GaugeIcon,
  LeafIcon,
  MapPinnedIcon,
  RouteIcon,
  ShieldCheckIcon,
  SparklesIcon,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { addDays, scoreCrowdForDate, toDateInputValue } from "@/features/tourism/crowd"
import { generateLocalItinerary, getDefaultItineraryRequest } from "@/features/tourism/itinerary"
import type { Attraction, BudgetLevel, CrowdLevel, ItineraryRequest, ItineraryResult, TourismData, TransportMode } from "@/features/tourism/types"
import { cn } from "@/lib/utils"

type PlannerWorkspaceProps = {
  initialData: TourismData
}

const interestOptions = ["parks", "culture", "food", "nature", "art", "walkable", "budget"]

const navItems = [
  { label: "Planner", icon: RouteIcon },
  { label: "Attractions", icon: MapPinnedIcon },
  { label: "Crowd Calendar", icon: CalendarDaysIcon },
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
    generateLocalItinerary(getDefaultItineraryRequest(), initialData)
  )
  const [isPending, startTransition] = useTransition()

  const crowdForecast = useMemo(() => {
    const start = new Date(`${request.startDate}T00:00:00`)

    return Array.from({ length: request.days }, (_, index) => {
      const date = addDays(start, index)
      const crowd = scoreCrowdForDate(date, request, tourismData)

      return {
        date,
        dateValue: toDateInputValue(date),
        ...crowd,
      }
    })
  }, [request, tourismData])

  function updateRequest(patch: Partial<ItineraryRequest>) {
    setRequest((current) => ({ ...current, ...patch }))
  }

  function generateItinerary() {
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
        toast.success(result.source === "openai" ? "AI itinerary generated" : "Local itinerary generated")
      } catch (error) {
        const result = generateLocalItinerary(request, tourismData)
        setItinerary(result)
        toast.warning(error instanceof Error ? error.message : "Using local planner fallback")
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
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[17rem_1fr]">
        <aside className="border-b bg-sidebar px-5 py-4 text-sidebar-foreground lg:border-r lg:border-b-0 lg:py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LeafIcon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Breathe Baguio</p>
              <p className="text-xs text-muted-foreground">Responsible trip planner</p>
            </div>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto text-sm lg:mt-8 lg:grid lg:overflow-visible">
            {navItems.map(({ icon: Icon, label }) => (
              <a
                className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                href={`#${label.toLowerCase().replaceAll(" ", "-")}`}
                key={label}
              >
                <Icon className="size-4" />
                {label}
              </a>
            ))}
            <a
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              href="/admin"
            >
              <ShieldCheckIcon className="size-4" />
              Admin
            </a>
          </nav>

          <Separator className="my-6 hidden lg:block" />

          <div className="hidden gap-3 text-sm lg:grid">
            <p className="font-medium">Capacity posture</p>
            <p className="text-muted-foreground">
              Use verified city data before production decisions. The current MVP uses editable rules and seed data.
            </p>
            <div className="grid gap-2">
              {tourismData.advisories.slice(0, 2).map((advisory) => (
                <div className="rounded-lg border bg-background p-3" key={advisory.id}>
                  <p className="font-medium">{advisory.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{advisory.area}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col">
          <header className="border-b px-5 py-4 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-normal">Breathe Baguio Planner</h1>
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                  AI-assisted itinerary planning with crowd rules, car-light guidance, and low-waste reminders.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <Metric label="Attractions" value={tourismData.attractions.length} />
                <Metric label="Events" value={tourismData.events.length} />
                <Metric label="Rules" value={tourismData.crowdRules.length} />
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 px-5 py-5 lg:px-8">
            <nav
              aria-label="Planner workspace sections"
              className="mb-5 flex w-full flex-wrap gap-1 rounded-lg bg-muted p-1"
            >
              {navItems.map((item) => (
                <a
                  className={cn(
                    "inline-flex h-8 flex-1 items-center justify-center rounded-md px-2.5 text-sm font-medium transition-colors",
                    "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                  )}
                  href={`#${item.label.toLowerCase().replaceAll(" ", "-")}`}
                  key={item.label}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="grid gap-8">
              <section id="planner">
                <div className="grid gap-5 xl:grid-cols-[25rem_1fr]">
                  <PlannerForm
                    isPending={isPending}
                  request={request}
                  onGenerate={generateItinerary}
                  onInterestToggle={toggleInterest}
                  onUpdate={updateRequest}
                />
                <div className="grid gap-5">
                  <CrowdPanel forecast={crowdForecast} />
                  <RoutePanel itinerary={itinerary} />
                </div>
              </div>
              </section>

              <section id="attractions">
                <SectionHeading title="Attractions" description="Verified-source candidates should replace this seed data before production." />
                <AttractionsGrid attractions={tourismData.attractions} />
              </section>

              <section id="crowd-calendar">
                <SectionHeading title="Crowd Calendar" description="Rule-based outlook for weekday, weekend, event, and transport pressure." />
                <CrowdCalendar data={tourismData} request={request} />
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function PlannerForm({
  isPending,
  request,
  onGenerate,
  onInterestToggle,
  onUpdate,
}: {
  isPending: boolean
  request: ItineraryRequest
  onGenerate: () => void
  onInterestToggle: (value: string) => void
  onUpdate: (patch: Partial<ItineraryRequest>) => void
}) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Trip brief</CardTitle>
        <CardDescription>Start with a realistic responsible-tourism constraint.</CardDescription>
        <CardAction>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button size="icon" variant="ghost" aria-label="Planner uses local fallback">
                  <GaugeIcon />
                </Button>
              }
            />
            <TooltipContent>Uses OpenAI only when OPENAI_API_KEY is configured.</TooltipContent>
          </Tooltip>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="notes">Planner prompt</FieldLabel>
            <Textarea
              id="notes"
              value={request.notes}
              onChange={(event) => onUpdate({ notes: event.target.value })}
              rows={4}
            />
            <FieldDescription>Example: 2-day Baguio trip, low budget, no private car.</FieldDescription>
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="days">Days</FieldLabel>
              <Input
                id="days"
                max={5}
                min={1}
                type="number"
                value={request.days}
                onChange={(event) => onUpdate({ days: Number(event.target.value) })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="startDate">Start date</FieldLabel>
              <Input
                id="startDate"
                type="date"
                value={request.startDate}
                onChange={(event) => onUpdate({ startDate: event.target.value })}
              />
            </Field>
          </div>

          <FieldSet>
            <FieldLegend>Budget</FieldLegend>
            <ToggleGroup
              value={[request.budget]}
              onValueChange={(value) => onUpdate({ budget: (value.at(-1) || request.budget) as BudgetLevel })}
            >
              <ToggleGroupItem value="low">Low</ToggleGroupItem>
              <ToggleGroupItem value="mid">Mid</ToggleGroupItem>
              <ToggleGroupItem value="premium">Premium</ToggleGroupItem>
            </ToggleGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Transport</FieldLegend>
            <ToggleGroup
              className="flex-wrap"
              value={[request.transportMode]}
              onValueChange={(value) =>
                onUpdate({ transportMode: (value.at(-1) || request.transportMode) as TransportMode })
              }
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
              {interestOptions.map((interest) => (
                <Button
                  key={interest}
                  type="button"
                  variant={request.interests.includes(interest) ? "default" : "outline"}
                  onClick={() => onInterestToggle(interest)}
                >
                  {interest}
                </Button>
              ))}
            </div>
          </FieldSet>

          <Button disabled={isPending} onClick={onGenerate}>
            <SparklesIcon data-icon="inline-start" />
            {isPending ? "Generating" : "Generate itinerary"}
          </Button>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

function SectionHeading({ description, title }: { description: string; title: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function CrowdPanel({
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
        <CardTitle>Tourist crowd score</CardTitle>
        <CardDescription>Rule-based score using weekday, weekend, event, and transport factors.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {forecast.map((day) => (
          <div className="grid gap-2 rounded-lg border p-3 md:grid-cols-[8rem_1fr_8rem] md:items-center" key={day.dateValue}>
            <div>
              <p className="font-medium">{day.dateValue}</p>
              <p className="text-xs text-muted-foreground">{day.factors.join(", ")}</p>
            </div>
            <Progress value={day.score}>
              <ProgressLabel>{day.level}</ProgressLabel>
              <span className="ml-auto text-sm text-muted-foreground tabular-nums">{day.score}/100</span>
            </Progress>
            <Badge className="justify-self-start md:justify-self-end" variant={crowdBadgeVariant[day.level]}>
              {day.level}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function RoutePanel({ itinerary }: { itinerary: ItineraryResult }) {
  return (
    <div className="grid gap-5 2xl:grid-cols-[1fr_18rem]">
      <Card>
        <CardHeader>
          <CardTitle>{itinerary.title}</CardTitle>
          <CardDescription>
            Source: {itinerary.source === "openai" ? "OpenAI assisted" : "local planning rules"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="route-map min-h-56 rounded-lg border p-4">
            <div className="grid gap-4">
              {itinerary.days.flatMap((day) =>
                day.stops.map((stop, index) => (
                  <div className="grid grid-cols-[2.5rem_1fr] gap-3" key={`${day.day}-${stop.attractionId}`}>
                    <div className="flex flex-col items-center">
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {index + 1}
                      </span>
                      <span className="h-full min-h-8 w-px bg-border" />
                    </div>
                    <div className="rounded-lg bg-background/85 p-3 ring-1 ring-border">
                      <p className="text-xs text-muted-foreground">
                        Day {day.day} at {stop.time} - {stop.district}
                      </p>
                      <p className="font-medium">{stop.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{stop.guidance}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5">
        <GuidanceCard
          icon={CarIcon}
          title="Leave your car"
          items={itinerary.carFreeSuggestions}
        />
        <GuidanceCard
          icon={LeafIcon}
          title="Eco reminders"
          items={itinerary.ecoReminders}
        />
      </div>
    </div>
  )
}

function AttractionsGrid({ attractions }: { attractions: Attraction[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {attractions.map((attraction) => (
        <Card key={attraction.id}>
          <CardHeader>
            <CardTitle>{attraction.name}</CardTitle>
            <CardDescription>{attraction.location}</CardDescription>
            <CardAction>
              <Badge variant={crowdBadgeVariant[attraction.baselineCrowd]}>{attraction.baselineCrowd}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-sm">
              <p className="font-medium">{attraction.openingHours}</p>
              <p className="mt-1 text-muted-foreground">{attraction.district}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {attraction.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">{attraction.carFreeHint}</p>
            <p className="text-sm text-muted-foreground">{attraction.wasteReminder}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CrowdCalendar({ data, request }: { data: TourismData; request: ItineraryRequest }) {
  const rows = useMemo(() => {
    const start = new Date(`${request.startDate}T00:00:00`)

    return Array.from({ length: 14 }, (_, index) => {
      const date = addDays(start, index)
      const crowd = scoreCrowdForDate(date, request, data)

      return {
        date: toDateInputValue(date),
        ...crowd,
      }
    })
  }, [data, request])

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
      <Card>
        <CardHeader>
          <CardTitle>Two-week capacity outlook</CardTitle>
          <CardDescription>Editable event windows and crowd rules affect these scores.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Factors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.date}>
                  <TableCell className="font-medium">{row.date}</TableCell>
                  <TableCell>{row.score}/100</TableCell>
                  <TableCell>
                    <Badge variant={crowdBadgeVariant[row.level]}>{row.level}</Badge>
                  </TableCell>
                  <TableCell>{row.factors.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GuidanceCard
        icon={AlertTriangleIcon}
        title="Active advisories"
        items={data.advisories.map((advisory) => `${advisory.area}: ${advisory.message}`)}
      />
    </div>
  )
}

function GuidanceCard({
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
          <Icon className="size-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 text-sm text-muted-foreground">
          {items.slice(0, 5).map((item) => (
            <li className="grid grid-cols-[1rem_1fr] gap-2" key={item}>
              <span className="mt-2 size-1.5 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
