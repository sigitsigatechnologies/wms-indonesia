import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: "bg-[#202124] text-white",
    secondary: "bg-[#F7F9FC] text-[#202124] border border-[#202124]",
    destructive: "bg-red-50 text-[#1A73E8] border border-[#1A73E8]",
    outline: "border border-[#202124] text-[#202124]",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none ${variantStyles[variant]} ${className || ""}`}
      {...props}
    />
  )
}

export { Badge }
