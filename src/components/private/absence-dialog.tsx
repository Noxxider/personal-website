"use client";

import * as React from "react";
import type { Absence } from "@/private/schedule";
import { absentDayCount } from "@/private/citizenship";
import { isIsoDate, prettyDate } from "@/private/workdays";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Draft = { from: string; to: string; note: string };

const EMPTY: Draft = { from: "", to: "", note: "" };

export function AbsenceDialog({
  open,
  onOpenChange,
  editing,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The trip being edited, or null when adding a new one. */
  editing: Absence | null;
  onSave: (absence: Absence) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="absence-help">
        {/* Keyed so the form resets itself whenever a different trip is
            opened, rather than being synchronised after the fact. */}
        <AbsenceForm
          key={editing?.id ?? "new"}
          editing={editing}
          onSave={(absence) => {
            onSave(absence);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
          onDelete={(id) => {
            onDelete(id);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function AbsenceForm({
  editing,
  onSave,
  onCancel,
  onDelete,
}: {
  editing: Absence | null;
  onSave: (absence: Absence) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = React.useState<Draft>(() =>
    editing
      ? { from: editing.from, to: editing.to, note: editing.note ?? "" }
      : EMPTY,
  );
  const [error, setError] = React.useState<string | null>(null);

  const days =
    isIsoDate(draft.from) && isIsoDate(draft.to)
      ? absentDayCount({ id: "draft", from: draft.from, to: draft.to })
      : null;

  function save() {
    if (!isIsoDate(draft.from) || !isIsoDate(draft.to)) {
      setError("Both dates are needed.");
      return;
    }
    if (draft.to < draft.from) {
      setError("The return date is before the departure date.");
      return;
    }
    onSave({
      id: editing?.id ?? `${draft.from}-${Math.random().toString(36).slice(2, 8)}`,
      from: draft.from,
      to: draft.to,
      note: draft.note.trim() || undefined,
    });
  }

  return (
    <>
      <DialogTitle>{editing ? "Edit trip" : "Add a trip"}</DialogTitle>
      <DialogDescription id="absence-help">
        Enter the day you left Canada and the day you came back. Both of those
        days still count as days in Canada, so only the days between them are
        subtracted.
      </DialogDescription>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="from">Left Canada</Label>
          <Input
            id="from"
            type="date"
            value={draft.from}
            onChange={(e) => {
              setDraft({ ...draft, from: e.target.value });
              setError(null);
            }}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="to">Returned</Label>
          <Input
            id="to"
            type="date"
            value={draft.to}
            onChange={(e) => {
              setDraft({ ...draft, to: e.target.value });
              setError(null);
            }}
            className="mt-2"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="note">Note, optional</Label>
        <Input
          id="note"
          value={draft.note}
          maxLength={80}
          placeholder="Where, or why"
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          className="mt-2"
        />
      </div>

      <p
        role="status"
        className="mt-5 border-t border-line pt-4 text-[0.875rem] text-ink-muted"
      >
        {error ? (
          <span className="text-signal">{error}</span>
        ) : days === null ? (
          "Pick both dates to see how many days this costs."
        ) : days === 0 ? (
          "No days lost. Leaving and returning both count as days in Canada."
        ) : (
          <>
            <span className="tabular font-mono text-ink">{days}</span> day
            {days === 1 ? "" : "s"} outside Canada
            {isIsoDate(draft.from) && (
              <>
                , {prettyDate(draft.from)} to {prettyDate(draft.to)}
                </>
              )}
              .
            </>
          )}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={save}
            className={buttonVariants({ size: "sm" })}
          >
            {editing ? "Save trip" : "Add trip"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Cancel
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => onDelete(editing.id)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "ml-auto text-signal hover:bg-signal-soft hover:text-signal",
              )}
            >
              Delete
            </button>
          )}
      </div>
    </>
  );
}
