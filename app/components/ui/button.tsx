"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "rounded-full font-bold text-sm tracking-wide",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94F7A] focus-visible:ring-offset-2",
    "active:scale-95",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-[#D94F7A] text-white shadow-md hover:bg-[#b83d63] hover:shadow-[#D94F7A]/40 hover:shadow-lg disabled:pointer-events-none disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none",

        secondary:
          "bg-[#E8789F] text-white shadow-sm hover:bg-[#D94F7A] disabled:pointer-events-none disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none",

        /** Outline: transparent bg, pink border + text — "Button Outlined" in Figma */
        outline:
          "bg-transparent border-2 border-[#D94F7A] text-[#D94F7A] hover:bg-[#D94F7A] hover:text-white disabled:pointer-events-none disabled:border-gray-200 disabled:text-gray-400",

        /** Disabled visual style (also use disabled prop for real disabled) */
        disabled:
          "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none shadow-none",

        ghost:
          "bg-transparent text-[#D94F7A] hover:bg-pink-50 disabled:pointer-events-none disabled:text-gray-400",

        link: "bg-transparent text-[#D94F7A] underline-offset-4 hover:underline p-0 h-auto disabled:pointer-events-none disabled:text-gray-400",

        // Keep shadcn default for backwards-compat with existing usages
        default:
          "bg-[#D94F7A] text-white shadow-md hover:bg-[#b83d63] disabled:pointer-events-none disabled:bg-gray-200 disabled:text-gray-400",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 disabled:pointer-events-none disabled:opacity-50",
      },

      size: {
        sm: "h-8 px-4 py-1.5 text-xs",
        default: "h-10 px-6 py-2 text-sm",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // If disabled prop is passed, apply disabled variant styling automatically
    const resolvedVariant =
      disabled && variant !== "link" && variant !== "ghost"
        ? variant // keep variant but CSS handles disabled state via disabled: classes
        : variant;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant: resolvedVariant, size, className }),
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
