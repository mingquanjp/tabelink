"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "border-none bg-transparent p-0 shadow-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
