import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-95 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-0.5 focus-visible:ring-blue-500/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:from-red-600 hover:to-pink-700 hover:shadow-xl hover:-translate-y-0.5 focus-visible:ring-red-500/50",
        outline:
          "border-2 border-blue-200/50 bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm hover:bg-blue-50/50 hover:border-blue-300/70 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-blue-500/50",
        secondary:
          "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm hover:from-blue-200 hover:to-blue-300 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-blue-500/50",
        ghost:
          "text-slate-700 hover:bg-blue-50 hover:text-blue-900 rounded-xl",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
        success:
          "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:-translate-y-0.5 focus-visible:ring-emerald-500/50",
        warning:
          "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:from-amber-600 hover:to-orange-700 hover:shadow-xl hover:-translate-y-0.5 focus-visible:ring-amber-500/50",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-5 text-sm",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3 text-xs",
        lg: "h-13 rounded-xl px-8 has-[>svg]:px-6 text-base",
        icon: "size-11 rounded-xl",
        xs: "h-7 rounded-lg px-3 has-[>svg]:px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
