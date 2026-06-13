import * as React from "react"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-[#202124] bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      {...props}
    />
  )
}

export { Input }
