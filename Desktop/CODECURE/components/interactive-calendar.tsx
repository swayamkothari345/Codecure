"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Pill,
  Activity,
  FileText,
  Camera,
  X,
} from "lucide-react"
import { CalendarEvent, TimelineEntry } from "@/lib/data-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface InteractiveCalendarProps {
  calendarEvents: Record<string, CalendarEvent>
}

export function InteractiveCalendar({ calendarEvents }: InteractiveCalendarProps) {
  const { t, language } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDay = firstDayOfMonth.getDay()

  const monthNames = language === "hi" ? [
    "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
  ] : [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = language === "hi" ? [
    "रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"
  ] : [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
  ]

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getDateKey = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getEventForDay = (day: number): CalendarEvent | undefined => {
    const dateKey = getDateKey(day)
    return calendarEvents[dateKey]
  }

  const getStatusColor = (status: CalendarEvent["overallStatus"]) => {
    switch (status) {
      case "worsening":
        return "bg-destructive"
      case "improving":
        return "bg-warning"
      default:
        return "bg-primary"
    }
  }

  const getStatusBgColor = (status: CalendarEvent["overallStatus"]) => {
    switch (status) {
      case "worsening":
        return "bg-destructive/10"
      case "improving":
        return "bg-warning/10"
      default:
        return "bg-primary/10"
    }
  }

  const getEntryIcon = (type: TimelineEntry["type"]) => {
    switch (type) {
      case "medicine":
        return <Pill className="h-3.5 w-3.5" />
      case "symptom":
        return <Activity className="h-3.5 w-3.5" />
      case "report":
        return <FileText className="h-3.5 w-3.5" />
      case "image":
        return <Camera className="h-3.5 w-3.5" />
      default:
        return <FileText className="h-3.5 w-3.5" />
    }
  }

  const getStatusText = (status: CalendarEvent["overallStatus"]) => {
    switch (status) {
      case "worsening":
        return t("worsening")
      case "improving":
        return t("improving")
      default:
        return t("normal")
    }
  }

  const getConditionText = (condition: string) => {
    switch (condition) {
      case "better":
        return t("better")
      case "worse":
        return t("worse")
      default:
        return t("same")
    }
  }

  const selectedEvent = selectedDate ? calendarEvents[selectedDate] : null

  const days = []
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 sm:h-12" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const event = getEventForDay(day)
    const dateKey = getDateKey(day)
    const isToday = new Date().toISOString().split("T")[0] === dateKey
    
    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(dateKey)}
        className={`relative flex h-10 w-full items-center justify-center rounded-lg text-sm transition-all sm:h-12 ${
          event 
            ? `cursor-pointer hover:ring-2 hover:ring-primary ${getStatusBgColor(event.overallStatus)}` 
            : "cursor-pointer hover:bg-muted"
        } ${isToday ? "font-bold ring-2 ring-primary" : ""}`}
      >
        {day}
        {event && (
          <div 
            className={`absolute bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ${getStatusColor(event.overallStatus)}`} 
          />
        )}
      </button>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarIcon className="h-4 w-4 text-primary" />
              {t("healthCalendar")}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center text-sm font-medium">
                {monthNames[month]} {year}
              </span>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">{t("normal")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-full bg-warning" />
              <span className="text-muted-foreground">{t("improving")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span className="text-muted-foreground">{t("worsening")}</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {days}
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString(
                language === "hi" ? "hi-IN" : "en-US", 
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {selectedEvent ? (
              <div className="space-y-4 pr-4">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{t("overallStatus")}:</span>
                  <Badge
                    className={
                      selectedEvent.overallStatus === "worsening"
                        ? "bg-destructive text-destructive-foreground"
                        : selectedEvent.overallStatus === "improving"
                          ? "bg-warning text-warning-foreground"
                          : "bg-primary text-primary-foreground"
                    }
                  >
                    {getStatusText(selectedEvent.overallStatus)}
                  </Badge>
                </div>

                {/* Entries */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">{t("activities")}</p>
                  {selectedEvent.entries.length === 0 ? (
                    <p className="rounded-lg border border-dashed py-4 text-center text-sm text-muted-foreground">
                      {t("noEntriesThisDay")}
                    </p>
                  ) : (
                    selectedEvent.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {getEntryIcon(entry.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {entry.type === "medicine" ? t("medicines") : 
                               entry.type === "symptom" ? t("symptoms") : 
                               entry.type === "report" ? t("reports") : 
                               entry.type === "image" ? t("images") : entry.type}
                            </Badge>
                            <span className="shrink-0 text-xs text-muted-foreground">{entry.time}</span>
                          </div>
                          <p className="mt-1.5 text-sm">{entry.content}</p>
                          {entry.condition && (
                            <Badge
                              className={`mt-2 ${
                                entry.condition === "worse"
                                  ? "bg-destructive/10 text-destructive"
                                  : entry.condition === "better"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {t("feeling")} {getConditionText(entry.condition)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <CalendarIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">{t("noEntriesThisDay")}</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
