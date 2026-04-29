"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "bg-card text-card-foreground border border-border shadow-sm rounded-xl",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:opacity-90 rounded-lg",
          cancelButton:
            "bg-secondary text-secondary-foreground hover:opacity-90 rounded-lg",
        },
      }}
    />
  );
}

