import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import * as React from "react"

const drawerVariants = {
  default: "fixed z-50 gap-4 bg-background",
  left: "inset-0 flex h-full w-[256px] max-w-[90vh]",
  right: "inset-0 flex h-full w-[256px] max-w-[90vh]",
  top: "inset-0 flex h-[256px] max-h-[90vh] w-full",
  bottom: "inset-0 flex h-[256px] max-h-[90vh] w-full",
}

interface DrawerProps extends React.ComponentProps<typeof DialogPrimitive.Root> {
  className?: string
  side?: "left" | "right" | "top" | "bottom"
}

function Drawer({
  className,
  side = "right",
  children,
  ...props
}: DrawerProps) {
  return (
    <DialogPrimitive.Root
      {...props}
    >
      <DialogPrimitive.Overlay className="bg-inverse-surface/40 fixed inset-0 z-40 backdrop-blur-[4px]" />
      <DialogPrimitive.Content
        data-slot="drawer"
        className={cn(
          drawerVariants.default,
          drawerVariants[side],
          "flex h-full flex-col overflow-y-auto scrollbar-thin",
          "bg-background border-border",
          "shadow-lg",
          "focus:outline-none",
          className
        )}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Root>
  )
}

interface DrawerTriggerProps extends React.ComponentProps<typeof DialogPrimitive.Trigger> {
  className?: string
  children: React.ReactNode
}

function DrawerTrigger({
  className,
  children,
  ...props
}: DrawerTriggerProps) {
  return (
    <DialogPrimitive.Trigger
      data-slot="drawer-trigger"
      className={className}
      {...props}
    >
      {children}
    </DialogPrimitive.Trigger>
  )
}

interface DrawerHeaderProps extends React.ComponentProps<"div"> {
  className?: string
  children: React.ReactNode
}

function DrawerHeader({
  className,
  children,
  ...props
}: DrawerHeaderProps) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col space-y-2 border-b pb-4 pt-5 px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface DrawerFooterProps extends React.ComponentProps<"div"> {
  className?: string
  children: React.ReactNode
}

function DrawerFooter({
  className,
  children,
  ...props
}: DrawerFooterProps) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "flex flex-col-reverse space-y-2 border-t pt-4 pb-5 px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface DrawerTitleProps extends React.ComponentProps<"h2"> {
  className?: string
  children: React.ReactNode
}

function DrawerTitle({
  className,
  children,
  ...props
}: DrawerTitleProps) {
  return (
    <h2
      data-slot="drawer-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

interface DrawerDescriptionProps extends React.ComponentProps<"p"> {
  className?: string
  children: React.ReactNode
}

function DrawerDescription({
  className,
  children,
  ...props
}: DrawerDescriptionProps) {
  return (
    <p
      data-slot="drawer-description"
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

export {
  Drawer,
  DrawerTrigger,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  drawerVariants
}
export type {
  DrawerProps,
  DrawerTriggerProps,
  DrawerHeaderProps,
  DrawerFooterProps,
  DrawerTitleProps,
  DrawerDescriptionProps
}