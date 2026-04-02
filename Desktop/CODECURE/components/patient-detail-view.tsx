"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Activity, 
  Brain, 
  FileText, 
  Camera, 
  Calendar,
  History,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Pill,
} from "lucide-react"
import { PatientData, generateAISummary } from "@/lib/data-store"
import { RecoveryChart } from "@/components/recovery-chart"
import { InteractiveCalendar } from "@/components/interactive-calendar"
import { ChatPanel } from "@/components/chat-panel"

interface PatientDetailViewProps {
  patient: {
    id: string
    name: string
    email: string
    data: PatientData
    status: "stable" | "warning" | "emergency"
  }
  onBack: () => void
  onSendMessage: (content: string) => void
}

export function PatientDetailView({ patient, onBack, onSendMessage }: PatientDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const aiSummary = generateAISummary(patient.id)

  // Get messages formatted for chat panel
  const messages = Object.values(patient.data.messages).flat().map(m => ({
    id: m.id,
    sender: m.senderRole,
    content: m.content,
    timestamp: new Date(m.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  }))

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ${
                patient.status === "emergency"
                  ? "bg-destructive text-destructive-foreground"
                  : patient.status === "warning"
                  ? "bg-warning text-warning-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {patient.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{patient.name}</h1>
              <p className="text-muted-foreground">{patient.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={
                patient.status === "emergency"
                  ? "bg-destructive text-destructive-foreground"
                  : patient.status === "warning"
                  ? "bg-warning text-warning-foreground"
                  : "bg-primary text-primary-foreground"
              }
            >
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              Score: {patient.data.healthScore}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="gap-1">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="ai-summary" className="gap-1">
            <Brain className="h-4 w-4" />
            AI Summary
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1">
            <History className="h-4 w-4" />
            Medical History
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-1">
            <Camera className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Patient Overview Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  Patient Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Health Score</span>
                  <span className="text-2xl font-bold text-primary">
                    {patient.data.healthScore}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Condition</span>
                  <Badge
                    className={
                      patient.data.currentCondition === "worse"
                        ? "bg-destructive/10 text-destructive"
                        : patient.data.currentCondition === "better"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {patient.data.currentCondition 
                      ? patient.data.currentCondition.charAt(0).toUpperCase() + patient.data.currentCondition.slice(1)
                      : "Not reported"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Medicine Today</span>
                  <Badge
                    className={
                      patient.data.tookMedicineToday
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }
                  >
                    {patient.data.tookMedicineToday ? "Taken" : "Not taken"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Update</span>
                  <span className="text-sm">
                    {new Date(patient.data.lastUpdated).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-primary/5 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{patient.data.timeline.length}</p>
                  <p className="text-xs text-muted-foreground">Timeline Entries</p>
                </div>
                <div className="rounded-xl bg-primary/5 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{patient.data.reports.length}</p>
                  <p className="text-xs text-muted-foreground">Reports</p>
                </div>
                <div className="rounded-xl bg-primary/5 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{patient.data.images.length}</p>
                  <p className="text-xs text-muted-foreground">Images</p>
                </div>
                <div className="rounded-xl bg-primary/5 p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {Object.keys(patient.data.calendarEvents).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Days</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recovery Chart */}
          <RecoveryChart data={patient.data.recoveryData} />

          {/* Chat */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Communication</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[350px]">
                <ChatPanel
                  messages={messages}
                  patientName={patient.name}
                  role="doctor"
                  onSendMessage={onSendMessage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Summary Tab */}
        <TabsContent value="ai-summary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI-Generated Patient Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Level Banner */}
              <div
                className={`rounded-xl p-4 ${
                  aiSummary.riskLevel === "high"
                    ? "bg-destructive/10 border border-destructive/20"
                    : aiSummary.riskLevel === "medium"
                    ? "bg-warning/10 border border-warning/20"
                    : "bg-primary/10 border border-primary/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  {aiSummary.riskLevel === "high" ? (
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  ) : aiSummary.riskLevel === "medium" ? (
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                  <div>
                    <p className="font-semibold">
                      Risk Level: {aiSummary.riskLevel.toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {aiSummary.suggestedAction}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-xl border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Current Problem</p>
                  <p className="font-medium">{aiSummary.currentProblem}</p>
                </div>
                
                <div className="space-y-2 rounded-xl border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Recovery Status</p>
                  <div className="flex items-center gap-2">
                    {aiSummary.recoveryStatus.includes("Improving") ? (
                      <TrendingUp className="h-4 w-4 text-primary" />
                    ) : aiSummary.recoveryStatus.includes("Declining") ? (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{aiSummary.recoveryStatus}</span>
                  </div>
                </div>
                
                <div className="space-y-2 rounded-xl border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Pattern Detection</p>
                  <p className="font-medium">{aiSummary.patternDetection}</p>
                </div>
                
                <div className="space-y-2 rounded-xl border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Medication Adherence</p>
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    <span className="font-medium">{aiSummary.medicationAdherence}</span>
                  </div>
                </div>
                
                <div className="space-y-2 rounded-xl border p-4 sm:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Medical History Summary</p>
                  <p className="font-medium">{aiSummary.medicalHistory}</p>
                </div>
              </div>

              {/* Suggested Action */}
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Recommended Action</p>
                <p className="font-semibold text-primary">{aiSummary.suggestedAction}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Medical History Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.data.timeline.length === 0 ? (
                <div className="text-center py-8">
                  <History className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No medical history entries yet</p>
                </div>
              ) : (
                patient.data.timeline.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 rounded-xl border p-4 transition-all hover:bg-muted/30"
                  >
                    <div className={`mt-0.5 h-3 w-3 rounded-full shrink-0 ${
                      entry.type === "symptom" ? "bg-destructive" :
                      entry.type === "medicine" ? "bg-primary" :
                      "bg-muted-foreground"
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs">
                          {entry.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {entry.date} at {entry.time}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{entry.content}</p>
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
                          Feeling {entry.condition}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Medical Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.data.reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No reports uploaded yet</p>
                </div>
              ) : (
                patient.data.reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-xl border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded: {new Date(report.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {report.aiSummary && (
                        <Badge variant="secondary" className="gap-1">
                          <Brain className="h-3 w-3" />
                          AI Analyzed
                        </Badge>
                      )}
                    </div>
                    
                    {report.aiSummary && (
                      <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                        <p className="text-sm font-medium">AI Summary:</p>
                        <p className="text-sm">{report.aiSummary.problem}</p>
                        <div className="flex flex-wrap gap-1">
                          {report.aiSummary.abnormalValues.map((val, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {val}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Condition Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.data.images.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {patient.data.images.map((image, index) => (
                    <div key={image.id} className="space-y-2">
                      <div className="aspect-square overflow-hidden rounded-xl border">
                        <img
                          src={image.url}
                          alt={image.note}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Day {patient.data.images.length - index}</p>
                        <p className="text-xs text-muted-foreground">{image.note}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(image.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <InteractiveCalendar calendarEvents={patient.data.calendarEvents} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
