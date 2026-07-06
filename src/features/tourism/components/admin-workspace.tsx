"use client"

import { FormEvent, ReactNode, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOutIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Advisory, Attraction, CrowdRule, TourismData, TourismEvent } from "@/features/tourism/types"
import { cn } from "@/lib/utils"

export function AdminWorkspace({
  initialData,
  userEmail,
}: {
  initialData: TourismData
  userEmail: string
}) {
  const router = useRouter()
  const [tourismData, setTourismData] = useState(initialData)

  async function addAttraction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const name = String(form.get("name") || "").trim()
    const district = String(form.get("district") || "").trim()

    if (!name || !district) {
      toast.error("Attraction name and district are required")
      return
    }

    try {
      const attraction = await postAdminRecord<Attraction>("/api/admin/attractions", {
        name,
        district,
        location: String(form.get("location") || "Admin added location").trim(),
        openingHours: String(form.get("openingHours") || "Hours to verify").trim(),
        tags: String(form.get("tags") || "admin")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        baselineCrowd: "moderate",
        carFreeHint: "Verify car-free access guidance before publishing.",
        wasteReminder: "Confirm waste guidance before publishing.",
        durationHours: 2,
        sourceName: String(form.get("sourceName") || "").trim(),
        sourceUrl: String(form.get("sourceUrl") || "").trim(),
      })

      setTourismData((current) => ({
        ...current,
        attractions: [attraction, ...current.attractions],
      }))
      formElement.reset()
      toast.success("Attraction saved to Supabase")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save attraction")
    }
  }

  async function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const name = String(form.get("name") || "").trim()
    const startsOn = String(form.get("startsOn") || "").trim()
    const endsOn = String(form.get("endsOn") || startsOn).trim()

    if (!name || !startsOn) {
      toast.error("Event name and start date are required")
      return
    }

    try {
      const tourismEvent = await postAdminRecord<TourismEvent>("/api/admin/events", {
        name,
        startsOn,
        endsOn,
        impact: "high",
        notes: String(form.get("notes") || "Admin event needs source verification.").trim(),
        sourceName: String(form.get("sourceName") || "").trim(),
        sourceUrl: String(form.get("sourceUrl") || "").trim(),
      })

      setTourismData((current) => ({
        ...current,
        events: [tourismEvent, ...current.events],
      }))
      formElement.reset()
      toast.success("Event saved to Supabase")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save event")
    }
  }

  async function addAdvisory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const title = String(form.get("title") || "").trim()
    const area = String(form.get("area") || "").trim()

    if (!title || !area) {
      toast.error("Advisory title and area are required")
      return
    }

    try {
      const advisory = await postAdminRecord<Advisory>("/api/admin/advisories", {
        title,
        area,
        severity: "warning",
        message: String(form.get("message") || "Admin advisory pending review.").trim(),
        sourceName: String(form.get("sourceName") || "").trim(),
        sourceUrl: String(form.get("sourceUrl") || "").trim(),
      })

      setTourismData((current) => ({
        ...current,
        advisories: [advisory, ...current.advisories],
      }))
      formElement.reset()
      toast.success("Advisory saved to Supabase")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save advisory")
    }
  }

  async function addCrowdRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const label = String(form.get("label") || "").trim()
    const condition = String(form.get("condition") || "").trim()
    const scoreImpact = Number(form.get("scoreImpact") || 0)

    if (!label || !condition || !Number.isFinite(scoreImpact)) {
      toast.error("Rule label, condition, and score impact are required")
      return
    }

    try {
      const rule = await postAdminRecord<CrowdRule>("/api/admin/crowd-rules", {
        label,
        condition,
        scoreImpact,
      })

      setTourismData((current) => ({
        ...current,
        crowdRules: [rule, ...current.crowdRules],
      }))
      formElement.reset()
      toast.success("Crowd rule saved to Supabase")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save crowd rule")
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground lg:px-8">
      <header className="mb-6 flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Signed in as {userEmail}</p>
          <h1 className="font-heading text-2xl font-semibold">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage attractions, tourism events, advisories, and crowd rules.
          </p>
        </div>
        <Button onClick={logout} type="button" variant="outline">
          <LogOutIcon data-icon="inline-start" />
          Sign out
        </Button>
      </header>

      <AdminDashboard
        data={tourismData}
        onAddAdvisory={addAdvisory}
        onAddAttraction={addAttraction}
        onAddCrowdRule={addCrowdRule}
        onAddEvent={addEvent}
      />
    </main>
  )
}

function AdminDashboard({
  data,
  onAddAdvisory,
  onAddAttraction,
  onAddCrowdRule,
  onAddEvent,
}: {
  data: TourismData
  onAddAdvisory: (event: FormEvent<HTMLFormElement>) => void
  onAddAttraction: (event: FormEvent<HTMLFormElement>) => void
  onAddCrowdRule: (event: FormEvent<HTMLFormElement>) => void
  onAddEvent: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[26rem_1fr]">
      <div className="grid gap-5">
        <AdminFormCard title="Add attraction" onSubmit={onAddAttraction}>
          <AdminInput label="Name" name="name" placeholder="Mirador Heritage Park" />
          <AdminInput label="District" name="district" placeholder="Dominican Hill" />
          <AdminInput label="Location" name="location" placeholder="Exact address or landmark" />
          <AdminInput label="Opening hours" name="openingHours" placeholder="8:00 AM - 5:00 PM" />
          <AdminInput label="Tags" name="tags" placeholder="nature, culture, walkable" />
          <AdminInput label="Source name" name="sourceName" placeholder="Baguio VISITA" />
          <AdminInput label="Source URL" name="sourceUrl" placeholder="https://visita.baguio.gov.ph/..." />
        </AdminFormCard>

        <AdminFormCard title="Add event" onSubmit={onAddEvent}>
          <AdminInput label="Name" name="name" placeholder="Flower parade weekend" />
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Starts on" name="startsOn" type="date" />
            <AdminInput label="Ends on" name="endsOn" type="date" />
          </div>
          <AdminInput label="Notes" name="notes" placeholder="Road closure or demand note" />
          <AdminInput label="Source name" name="sourceName" placeholder="PNA / Panagbenga" />
          <AdminInput label="Source URL" name="sourceUrl" placeholder="https://..." />
        </AdminFormCard>

        <AdminFormCard title="Add advisory" onSubmit={onAddAdvisory}>
          <AdminInput label="Title" name="title" placeholder="Avoid CBD parking" />
          <AdminInput label="Area" name="area" placeholder="Session Road" />
          <AdminInput label="Message" name="message" placeholder="Use walkable transfer points." />
          <AdminInput label="Source name" name="sourceName" placeholder="City advisory" />
          <AdminInput label="Source URL" name="sourceUrl" placeholder="https://..." />
        </AdminFormCard>

        <AdminFormCard title="Add crowd rule" onSubmit={onAddCrowdRule}>
          <AdminInput label="Label" name="label" placeholder="Long weekend surge" />
          <AdminInput label="Condition" name="condition" placeholder="Holiday bridge dates" />
          <AdminInput label="Score impact" name="scoreImpact" placeholder="18" type="number" />
        </AdminFormCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin data preview</CardTitle>
          <CardDescription>Records are persisted through Drizzle ORM into Supabase Postgres.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <PreviewTable
            columns={["Attraction", "District", "Crowd"]}
            rows={data.attractions.map((attraction) => [
              attraction.name,
              attraction.district,
              attraction.baselineCrowd,
            ])}
          />
          <PreviewTable
            columns={["Event", "Dates", "Impact"]}
            rows={data.events.map((event) => [event.name, `${event.startsOn} to ${event.endsOn}`, event.impact])}
          />
          <PreviewTable
            columns={["Rule", "Condition", "Impact"]}
            rows={data.crowdRules.map((rule) => [rule.label, rule.condition, `${rule.scoreImpact}`])}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function AdminFormCard({
  children,
  onSubmit,
  title,
}: {
  children: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  title: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          {children}
          <Button type="submit">
            <PlusIcon data-icon="inline-start" />
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AdminInput({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string
  name: string
  placeholder?: string
  type?: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input id={name} name={name} placeholder={placeholder} type={type} />
    </Field>
  )
}

function PreviewTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.slice(0, 6).map((row) => (
          <TableRow key={row.join("-")}>
            {row.map((cell, index) => (
              <TableCell className={cn(index === 0 && "font-medium")} key={`${cell}-${index}`}>
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

async function postAdminRecord<T>(url: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const body = (await response.json()) as { record?: T; error?: string }

  if (!response.ok || !body.record) {
    throw new Error(body.error || "Unable to save record.")
  }

  return body.record
}
