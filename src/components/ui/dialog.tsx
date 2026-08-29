"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CloseIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-ink/30 backdrop-blur-[3px]" />
      <DialogPrimitive.Content
        className={cn(
          "dialog-panel fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
          "rounded-2xl border border-line bg-paper p-6 shadow-2xl shadow-ink/15 sm:p-8",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-5 right-5 rounded-full p-2 text-ink-faint transition-colors hover:bg-paper-sunken hover:text-ink">
          <CloseIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-display text-2xl text-ink", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-2 text-[0.9375rem] leading-relaxed text-ink-muted", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
