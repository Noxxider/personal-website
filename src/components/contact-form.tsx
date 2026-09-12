"use client";

import * as React from "react";
import { useActionState } from "react";
import { sendMessage, type ContactState } from "@/app/contact/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const INITIAL: ContactState = { status: "idle" };

const KINDS = [
  { value: "workflow", label: "A workflow automated" },
  { value: "tool", label: "A tool for my team" },
  { value: "site", label: "A public site" },
  { value: "integration", label: "An integration or MCP server" },
  { value: "not sure", label: "Not sure yet" },
];

export function ContactForm({
  extended = false,
  submitLabel = "Send message",
}: {
  /** Adds the two /build questions: what, and roughly when. */
  extended?: boolean;
  submitLabel?: string;
}) {
  const [state, action, pending] = useActionState(sendMessage, INITIAL);
  const errorSummaryRef = React.useRef<HTMLParagraphElement>(null);

  if (state.status === "sent") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 sm:p-10">
        <p className="flex items-center gap-2.5 text-signal">
          <CheckIcon className="size-5" />
          <span className="font-display text-2xl">Message sent</span>
        </p>
        <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink-muted">
          Thank you, that reached my inbox. I read everything and will reply to
          the address you gave.
        </p>
      </div>
    );
  }

  const fieldError = (name: "name" | "email" | "message") =>
    state.fieldErrors?.[name];

  return (
    <form action={action} noValidate className="max-w-xl">
      {/* Hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Name"
          error={fieldError("name")}
          autoComplete="name"
        />
        <Field
          id="email"
          label="Email"
          type="email"
          error={fieldError("email")}
          autoComplete="email"
        />
      </div>

      {extended && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="kind">What would you like built?</Label>
            <select
              id="kind"
              name="kind"
              defaultValue="not sure"
              className="mt-2 h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[0.9375rem] text-ink transition-colors hover:border-ink-faint focus:border-ink focus:outline-none"
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="timeline">Rough timeline</Label>
            <Input
              id="timeline"
              name="timeline"
              maxLength={120}
              placeholder="This quarter, no rush, yesterday"
              className="mt-2"
            />
          </div>
        </div>
      )}

      <div className="mt-5">
        <Label htmlFor="message">
          {extended ? "What is the problem, in your words?" : "Message"}
        </Label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={4000}
          aria-invalid={fieldError("message") ? true : undefined}
          aria-describedby={fieldError("message") ? "message-error" : undefined}
          className={cn(
            "mt-2 w-full resize-y rounded-lg border bg-surface px-3.5 py-2.5 text-[0.9375rem] leading-relaxed text-ink transition-colors",
            "placeholder:text-ink-faint focus:outline-none",
            fieldError("message")
              ? "border-signal focus:border-signal"
              : "border-line-strong hover:border-ink-faint focus:border-ink",
          )}
        />
        {fieldError("message") && (
          <p id="message-error" className="mt-2 text-[0.8125rem] text-signal">
            {fieldError("message")}
          </p>
        )}
      </div>

      <p
        ref={errorSummaryRef}
        role="status"
        aria-live="polite"
        className={cn(
          "mt-5 text-[0.875rem] text-signal",
          state.message ? "" : "sr-only",
        )}
      >
        {state.message}
      </p>

      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ size: "lg" }), "mt-6")}
      >
        {pending ? "Sending" : submitLabel}
        {!pending && <ArrowRightIcon aria-hidden className="size-4" />}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  type = "text",
  autoComplete,
}: {
  id: "name" | "email";
  label: string;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        required
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn("mt-2", error && "border-signal")}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-[0.8125rem] text-signal">
          {error}
        </p>
      )}
    </div>
  );
}
