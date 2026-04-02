"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, TrendingUp, Minus, TrendingDown } from "lucide-react"

export function RecoveryForm() {
  const { t } = useLanguage()
  const [tookMedicine, setTookMedicine] = useState(false)
  const [condition, setCondition] = useState<"better" | "same" | "worse" | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const conditions = [
    { id: "better" as const, icon: TrendingUp, color: "bg-primary text-primary-foreground" },
    { id: "same" as const, icon: Minus, color: "bg-warning text-warning-foreground" },
    { id: "worse" as const, icon: TrendingDown, color: "bg-destructive text-destructive-foreground" },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("recoveryTracker")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Medicine Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("tookMedicine")}
          </label>
          <button
            onClick={() => setTookMedicine(!tookMedicine)}
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-xl border-2 px-4 transition-all",
              tookMedicine
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-muted-foreground/30"
            )}
          >
            <span className="text-sm text-foreground">
              {tookMedicine ? "Yes, I took my medicine" : "No, not yet"}
            </span>
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full transition-all",
                tookMedicine ? "bg-primary" : "bg-muted"
              )}
            >
              {tookMedicine && <Check className="h-4 w-4 text-primary-foreground" />}
            </div>
          </button>
        </div>

        {/* Condition Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("condition")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {conditions.map((c) => {
              const Icon = c.icon
              const isSelected = condition === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setCondition(c.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    isSelected
                      ? `${c.color} border-transparent shadow-lg`
                      : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{t(c.id)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!condition}
          className="w-full rounded-xl"
        >
          {submitted ? "Submitted!" : t("submit")}
        </Button>
      </CardContent>
    </Card>
  )
}
