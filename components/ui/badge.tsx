import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: "bg-[#1A2B4C] text-white",
    secondary: "bg-[#F7F9FC] text-[#1A2B4C] border border-[#1A2B4C]",
    destructive: "bg-red-50 text-[#FF4D5A] border border-[#FF4D5A]",
    outline: "border border-[#1A2B4C] text-[#1A2B4C]",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none ${variantStyles[variant]} ${className || ""}`}
      {...props}
    />
  )
}

export { Badge }
