"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Patient } from "@/lib/dummy-data"
import { cn } from "@/lib/utils"
import { Clock, ChevronRight } from "lucide-react"

interface PatientListProps {
  patients: Patient[]
  selectedPatient: Patient | null
  onSelectPatient: (patient: Patient) => void
}

const statusConfig = {
  stable: {
    label: "Stable",
    className: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  warning: {
    label: "Warning",
    className: "bg-warning/20 text-warning-foreground hover:bg-warning/30",
  },
  emergency: {
    label: "Emergency",
    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
}

export function PatientList({
  patients,
  selectedPatient,
  onSelectPatient,
}: PatientListProps) {
  const { t } = useLanguage()

  // Sort patients by priority (emergency first, then warning, then stable)
  const sortedPatients = [...patients].sort((a, b) => {
    const priority = { emergency: 0, warning: 1, stable: 2 }
    return priority[a.status] - priority[b.status]
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("patientList")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedPatients.map((patient) => {
          const config = statusConfig[patient.status]
          const isSelected = selectedPatient?.id === patient.id
          return (
            <button
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-sm"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  patient.status === "emergency"
                    ? "bg-destructive text-destructive-foreground"
                    : patient.status === "warning"
                    ? "bg-warning text-warning-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                {patient.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground truncate">
                    {patient.name}
                  </p>
                  <Badge variant="secondary" className={cn("shrink-0 text-xs", config.className)}>
                    {config.label}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Age: {patient.age}</span>
                  <span className="text-border">|</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {patient.lastUpdated}
                  </span>
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                  isSelected && "text-primary"
                )}
              />
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
