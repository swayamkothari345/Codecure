"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

interface Insight {
  message: string
  type: "positive" | "warning" | "neutral"
}

interface InsightsCardProps {
  title: string
  insights: Insight[]
}

const typeConfig = {
  positive: {
    icon: CheckCircle,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  warning: {
    icon: AlertCircle,
    className: "bg-warning/20 text-warning-foreground border-warning/30",
  },
  neutral: {
    icon: TrendingUp,
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function InsightsCard({ title, insights }: InsightsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight, index) => {
          const config = typeConfig[insight.type]
          const Icon = config.icon
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-sm",
                config.className
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">{insight.message}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

interface PatternDetectionProps {
  patterns: Array<{
    pattern: string
    severity: "low" | "medium" | "high"
  }>
}

export function PatternDetection({ patterns }: PatternDetectionProps) {
  const { t } = useLanguage()

  const severityConfig = {
    low: "bg-muted border-border text-muted-foreground",
    medium: "bg-warning/20 border-warning/30 text-foreground",
    high: "bg-destructive/10 border-destructive/30 text-destructive",
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          {t("patternDetection")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {patterns.map((item, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg border p-3 transition-all hover:shadow-sm",
              severityConfig[item.severity]
            )}
          >
            <p className="text-sm font-medium">{item.pattern}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface AISummaryProps {
  summaries: string[]
}

export function AISummary({ summaries }: AISummaryProps) {
  const { t } = useLanguage()

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          {t("aiSummary")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {summaries.map((summary, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-sm"
          >
            <div className="h-2 w-2 rounded-full bg-primary" />
            <p className="text-sm text-foreground">{summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
