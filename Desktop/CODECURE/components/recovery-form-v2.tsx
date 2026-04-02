"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Activity, 
  Pill, 
  ThumbsUp, 
  Minus, 
  ThumbsDown,
  Check,
  Loader2,
} from "lucide-react"
import { addTimelineEntry, savePatientData, getPatientData, updateRecoveryData } from "@/lib/data-store"
import { useLanguage } from "@/lib/language-context"

interface RecoveryFormV2Props {
  patientId: string
  onSubmit: () => void
}

export function RecoveryFormV2({ patientId, onSubmit }: RecoveryFormV2Props) {
  const { t } = useLanguage()
  const patientData = getPatientData(patientId)
  
  const [tookMedicine, setTookMedicine] = useState(patientData.tookMedicineToday)
  const [condition, setCondition] = useState<"better" | "same" | "worse" | null>(
    patientData.currentCondition
  )
  const [symptoms, setSymptoms] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!condition) return
    
    setIsSubmitting(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const today = new Date()
    const dateStr = today.toISOString().split("T")[0]
    const timeStr = today.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    
    // Add medicine entry if taken
    if (tookMedicine) {
      addTimelineEntry(patientId, {
        type: "medicine",
        content: "Took prescribed medication",
        date: dateStr,
        time: timeStr,
      })
    }
    
    // Add symptom entry if provided
    if (symptoms.trim()) {
      addTimelineEntry(patientId, {
        type: "symptom",
        content: symptoms,
        date: dateStr,
        time: timeStr,
        condition,
      })
    }
    
    // Add notes entry if provided
    if (notes.trim()) {
      addTimelineEntry(patientId, {
        type: "note",
        content: notes,
        date: dateStr,
        time: timeStr,
        condition,
      })
    }
    
    // Always add a general condition update
    if (!symptoms.trim() && !notes.trim()) {
      addTimelineEntry(patientId, {
        type: "note",
        content: `Daily check-in: Feeling ${condition}`,
        date: dateStr,
        time: timeStr,
        condition,
      })
    }
    
    // Update health score based on condition
    const currentData = getPatientData(patientId)
    let newScore = currentData.healthScore
    if (condition === "better") {
      newScore = Math.min(100, newScore + 3)
    } else if (condition === "worse") {
      newScore = Math.max(0, newScore - 5)
    }
    updateRecoveryData(patientId, newScore)
    
    // Save daily tracking state
    savePatientData(patientId, {
      tookMedicineToday: tookMedicine,
      currentCondition: condition,
    })
    
    setIsSubmitting(false)
    setSubmitted(true)
    
    // Reset after delay
    setTimeout(() => {
      setSubmitted(false)
      setSymptoms("")
      setNotes("")
      onSubmit()
    }, 1500)
  }

  const conditionOptions = [
    { value: "better" as const, label: t("better"), icon: ThumbsUp, color: "bg-primary text-primary-foreground" },
    { value: "same" as const, label: t("same"), icon: Minus, color: "bg-muted text-muted-foreground" },
    { value: "worse" as const, label: t("worse"), icon: ThumbsDown, color: "bg-destructive text-destructive-foreground" },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          {t("recoveryTracker")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Medicine Toggle */}
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t("tookMedicine")}</p>
              <p className="text-xs text-muted-foreground">{t("trackAdherence")}</p>
            </div>
          </div>
          <Switch
            checked={tookMedicine}
            onCheckedChange={setTookMedicine}
          />
        </div>

        {/* Condition Selection */}
        <div className="space-y-2">
          <Label>{t("condition")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {conditionOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCondition(option.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  condition === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    condition === option.value ? option.color : "bg-muted"
                  }`}
                >
                  <option.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-2">
          <Label htmlFor="symptoms">{t("symptomsOptional")}</Label>
          <Textarea
            id="symptoms"
            placeholder={t("describeSymptoms")}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={2}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">{t("additionalNotesOptional")}</Label>
          <Textarea
            id="notes"
            placeholder={t("anyOtherObservations")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          className="w-full gap-2"
          disabled={!condition || isSubmitting || submitted}
        >
          {submitted ? (
            <>
              <Check className="h-4 w-4" />
              {t("loggedSuccessfully")}
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("saving")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
