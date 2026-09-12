"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { CloseIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetTitle = SheetPrimitive.Title;
const SheetDescription = SheetPrimitive.Description;

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content>) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="sheet-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
      <SheetPrimitive.Content
        className={cn(
          "sheet-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-line bg-surface p-6 shadow-2xl shadow-black/50",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-6 right-6 rounded-full p-2 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink">
          <CloseIcon className="size-5" />
          <span className="sr-only">Close menu</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetDescription,
};
