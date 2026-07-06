"use client"

import { FormEvent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LeafIcon, LockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError(null)

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") || ""),
          password: String(form.get("password") || ""),
        }),
      })

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        setError(body.error || "Unable to log in.")
        return
      }

      router.push(nextPath)
      router.refresh()
    })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LeafIcon className="size-5" />
          </div>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>Use the configured admin credentials to manage tourism data.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input autoComplete="email" id="email" name="email" type="email" />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input autoComplete="current-password" id="password" name="password" type="password" />
              </Field>
              {error && <FieldDescription className="text-destructive">{error}</FieldDescription>}
              <Button disabled={isPending} type="submit">
                <LockIcon data-icon="inline-start" />
                {isPending ? "Signing in" : "Sign in"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
