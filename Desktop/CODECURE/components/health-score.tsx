"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HealthScoreProps {
  score: number
}

export function HealthScore({ score }: HealthScoreProps) {
  const { t } = useLanguage()
  
  // Calculate stroke dash for circular progress
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 70) return "stroke-primary"
    if (score >= 50) return "stroke-warning"
    return "stroke-destructive"
  }

  const getScoreLabel = () => {
    if (score >= 70) return t("good")
    if (score >= 50) return t("fair")
    return t("poor")
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t("healthScore")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-6">
        <div className="relative h-36 w-36">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              className="stroke-muted"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={`${getScoreColor()} transition-all duration-1000`}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">{score}</span>
            <span className="text-sm text-muted-foreground">{getScoreLabel()}</span>
          </div>
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {t("overallHealthStatus")}
        </p>
      </CardContent>
    </Card>
  )
}
