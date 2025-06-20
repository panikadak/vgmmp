import type React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  fullWidth?: boolean
  children: React.ReactNode
  className?: string
}

export function Button({ variant = "primary", fullWidth = false, children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[16px] px-6 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 btn-standard-height",
        variant === "primary" && "text-white hover:opacity-90 focus:ring-blue-500 btn-primary-gradient",
        variant === "secondary" && "bg-gray-200 text-gray-500 hover:bg-gray-300 focus:ring-gray-400",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
