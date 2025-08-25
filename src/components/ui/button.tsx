import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-body font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-neutral-950 hover:bg-brand-600 shadow-default",
        destructive:
          "bg-error-500 text-neutral-950 hover:bg-error-600 shadow-default",
        outline:
          "border border-neutral-border bg-transparent hover:bg-neutral-100 hover:text-default-font text-default-font",
        secondary:
          "bg-neutral-200 text-neutral-950 hover:bg-neutral-300 shadow-default",
        ghost: "hover:bg-neutral-100 hover:text-default-font text-subtext-color",
        link: "text-brand-primary underline-offset-4 hover:underline",
        success: "bg-success-600 text-neutral-950 hover:bg-success-700 shadow-default",
        warning: "bg-warning-600 text-neutral-950 hover:bg-warning-700 shadow-default",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-caption",
        lg: "h-11 px-8 text-body-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
