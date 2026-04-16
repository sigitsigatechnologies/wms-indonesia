import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  const variantStyles: Record<string, string> = {
    default: "bg-[#1A2B4C] text-white hover:bg-[#253358]",
    destructive: "bg-[#FF4D5A] text-white hover:bg-[#e64551]",
    outline: "border border-[#1A2B4C] bg-white text-[#1A2B4C] hover:bg-gray-50",
    secondary: "bg-[#F7F9FC] text-[#1A2B4C] border border-[#1A2B4C] hover:bg-gray-100",
    ghost: "text-[#1A2B4C] hover:bg-gray-100",
    link: "text-[#FF4D5A] underline-offset-4 hover:underline",
  }

  const sizeStyles: Record<string, string> = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-6",
    icon: "h-9 w-9",
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FF4D5A] focus:ring-offset-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`}
      {...props}
    />
  )
}

export { Button }
