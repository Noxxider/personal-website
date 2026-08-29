"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
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
      <SheetPrimitive.Overlay className="sheet-overlay fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px]" />
      <SheetPrimitive.Content
        className={cn(
          "sheet-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-line bg-paper p-6 shadow-2xl shadow-ink/10",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-6 right-6 rounded-full p-2 text-ink-muted transition-colors hover:bg-paper-sunken hover:text-ink">
          <XIcon className="size-5" />
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
