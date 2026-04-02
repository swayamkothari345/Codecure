"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// 🔥 Sample health data (replace later with backend)
const healthData: Record<number, { status: string; notes: string }> = {
  1: { status: "worsening", notes: "High fever, weakness" },
  2: { status: "improving", notes: "Fever reduced, feeling better" },
  3: { status: "normal", notes: "Recovered" },
  10: { status: "worsening", notes: "Chest pain reported" },
  15: { status: "improving", notes: "Medication working" },
}

export function CalendarView() {
  const { t } = useLanguage()
  const [selectedDate, setSelectedDate] = useState<number | null>(null)

  const daysInMonth = 31
  const startDay = 3
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getColor = (status: string) => {
    if (status === "worsening") return "bg-red-400"
    if (status === "improving") return "bg-yellow-300"
    return "bg-green-400"
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {t("calendar")}
          </CardTitle>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">January 2024</span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Week days */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = i + 1
            const data = healthData[date]

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "relative flex h-10 items-center justify-center rounded-lg text-sm transition-all hover:bg-muted",
                  selectedDate === date && "ring-2 ring-primary"
                )}
              >
                {date}

                {/* Dot indicator */}
                {data && (
                  <span
                    className={cn(
                      "absolute bottom-1 h-2 w-2 rounded-full",
                      getColor(data.status)
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Details Panel */}
        {selectedDate && healthData[selectedDate] && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-semibold mb-2">
              {t("details")} - {selectedDate}
            </h3>

            <p className="text-sm">
              <span className="font-medium">{t("status")}: </span>
              {healthData[selectedDate].status}
            </p>

            <p className="text-sm mt-1">
              <span className="font-medium">{t("notes")}: </span>
              {healthData[selectedDate].notes}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="text-xs text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-300" />
            <span className="text-xs text-muted-foreground">Improving</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="text-xs text-muted-foreground">Worsening</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}