"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Phone, Siren } from "lucide-react"
import { cn } from "@/lib/utils"

export function EmergencyAlertButton() {
  const { t } = useLanguage()
  const [isPressed, setIsPressed] = useState(false)
  const [alertSent, setAlertSent] = useState(false)

  const handlePress = () => {
    setIsPressed(true)
    setTimeout(() => {
      setIsPressed(false)
      setAlertSent(true)
      setTimeout(() => setAlertSent(false), 5000)
    }, 1000)
  }

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="flex flex-col items-center py-6">
        <button
          onClick={handlePress}
          disabled={alertSent}
          className={cn(
            "group relative flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300",
            alertSent
              ? "bg-primary shadow-lg"
              : "bg-destructive shadow-lg shadow-destructive/30 hover:scale-105 hover:shadow-xl hover:shadow-destructive/40 active:scale-95"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full transition-all",
              !alertSent && "animate-ping bg-destructive/30"
            )}
            style={{ animationDuration: "2s" }}
          />
          {alertSent ? (
            <Phone className="h-10 w-10 text-primary-foreground" />
          ) : (
            <Siren
              className={cn(
                "h-10 w-10 text-destructive-foreground transition-transform",
                isPressed && "animate-pulse"
              )}
            />
          )}
        </button>
        <p className="mt-4 text-center text-sm font-semibold text-foreground">
          {alertSent ? t("alertSentDoctorNotified") : t("emergencyAlert")}
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {alertSent
            ? t("helpOnTheWay")
            : t("pressInEmergency")}
        </p>
      </CardContent>
    </Card>
  )
}

interface EmergencyAlertsListProps {
  alerts: Array<{
    id: string
    patientName: string
    message: string
    time: string
  }>
}

export function EmergencyAlertsList({ alerts }: EmergencyAlertsListProps) {
  const { t } = useLanguage()

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {t("emergencyAlerts")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            {t("noEmergencyAlerts")}
          </p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 transition-all hover:bg-destructive/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{alert.patientName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{alert.time}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="destructive" className="flex-1 rounded-lg">
                  <Phone className="mr-1 h-3 w-3" />
                  {t("callNow")}
                </Button>
                <Button size="sm" variant="outline" className="flex-1 rounded-lg">
                  {t("viewDetails")}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
