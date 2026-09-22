import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import * as React from "react"

const popoverVariants = {
  default: "bg-popover border-popover/50 ring-offset-background",
}

interface PopoverProps extends React.ComponentProps<typeof PopoverPrimitive.Root> {
  children: React.ReactNode
  className?: string
}

function Popover({
  className,
  children,
  ...props
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root
      data-slot="popover"
      className={cn(popoverVariants.default, className)}
      {...props}
    >
      {children}
    </PopoverPrimitive.Root>
  )
}

interface PopoverTriggerProps extends React.ComponentProps<typeof PopoverPrimitive.Trigger> {
  children: React.ReactNode
  className?: string
}

function PopoverTrigger({
  className,
  children,
  ...props
}: PopoverTriggerProps) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={className}
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  )
}

interface PopoverContentProps extends React.ComponentProps<typeof PopoverPrimitive.Content> {
  className?: string
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  collisionBoundary?: HTMLElement | string
}

function PopoverContent({
  className,
  sideOffset = 4,
  alignOffset = 0,
  collisionPadding = 4,
  collisionBoundary: boundary = "clippingAncestors",
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Content
      data-slot="popover-content"
      className={cn(
        "bg-popover border-popover ring-offset-background shadow-lg pointer-events-auto",
        className
      )}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      collisionBoundary={collisionBoundary}
      {...props}
    >
      <PopoverPrimitive.Arrow className="h-1 w-1" />
      <div className="py-1" {...props} />
    </PopoverPrimitive.Content>
  )
}

interface PopoverHeaderProps extends React.ComponentProps<"div"> {
  className?: string
  children: React.ReactNode
}

function PopoverHeader({
  className,
  children,
  ...props
}: PopoverHeaderProps) {
  return (
    <div
      data-slot="popover-header"
      className={cn(
        "flex items-center space-x-2 rounded-t-md border-b px-3 py-2 text-sm font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface PopoverFooterProps extends React.ComponentProps<"div"> {
  className?: string
  children: React.ReactNode
}

function PopoverFooter({
  className,
  children,
  ...props
}: PopoverFooterProps) {
  return (
    <div
      data-slot="popover-footer"
      className={cn(
        "flex items-center space-x-2 rounded-b-md border-t px-3 py-2 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverFooter,
  popoverVariants
}
export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverHeaderProps,
  PopoverFooterProps
}