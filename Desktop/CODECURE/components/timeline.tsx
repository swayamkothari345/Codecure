"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pill, Stethoscope, FileText, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineEntry {
  id: string
  type: "symptom" | "medicine" | "note" | "report" | "image"
  content: string
  date: string
  time: string
}

interface TimelineProps {
  entries?: TimelineEntry[]
}

const typeConfig = {
  symptom: {
    icon: Stethoscope,
    color: "bg-destructive/10 text-destructive",
    borderColor: "border-l-destructive",
  },
  medicine: {
    icon: Pill,
    color: "bg-primary/10 text-primary",
    borderColor: "border-l-primary",
  },
  note: {
    icon: FileText,
    color: "bg-muted text-muted-foreground",
    borderColor: "border-l-muted-foreground",
  },
  report: {
    icon: FileText,
    color: "bg-warning/10 text-warning",
    borderColor: "border-l-warning",
  },
  image: {
    icon: Camera,
    color: "bg-primary/10 text-primary",
    borderColor: "border-l-primary",
  },
}

export function Timeline({ entries = [] }: TimelineProps) {
  const { t } = useLanguage()

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {t("healthTimeline")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="mb-2 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No timeline entries yet</p>
            <p className="text-xs text-muted-foreground">
              Log your symptoms, medicine, and notes to see them here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("healthTimeline")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => {
          const config = typeConfig[entry.type] || typeConfig.note
          const Icon = config.icon
          return (
            <div
              key={entry.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border-l-4 bg-card p-3 shadow-sm transition-all hover:shadow-md",
                config.borderColor
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {entry.content}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.date} at {entry.time}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
