"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { HealthScore } from "@/components/health-score"
import { Timeline } from "@/components/timeline"
import { RecoveryFormV2 } from "@/components/recovery-form-v2"
import { EmergencyAlertButton } from "@/components/alerts"
import { InteractiveCalendar } from "@/components/interactive-calendar"
import { InsightsCard, PatternDetection } from "@/components/insights-card"
import { RecoveryChart } from "@/components/recovery-chart"
import { ReportUpload } from "@/components/report-upload"
import { ImageUpload } from "@/components/image-upload"
import { DoctorSelector } from "@/components/doctor-selector"
import { ChatPanel } from "@/components/chat-panel"
import { 
  getPatientData, 
  getConnectedDoctors, 
  PatientData,
  addMessage,
} from "@/lib/data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

function PatientDashboardContent() {
  const { t } = useLanguage()
  const { user, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()
  
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Load patient data
  const loadData = useCallback(() => {
    if (user) {
      const data = getPatientData(user.id)
      setPatientData(data)
      const connectedDoctors = getConnectedDoctors(user.id)
      setDoctors(connectedDoctors)
      if (connectedDoctors.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(connectedDoctors[0].id)
      }
    }
  }, [user, selectedDoctorId])

  useEffect(() => {
    loadData()
  }, [loadData, refreshKey])

  // Redirect if not authenticated or not a patient
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    } else if (!authLoading && user && user.role !== "patient") {
      router.push("/doctor")
    }
  }, [user, authLoading, router])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSendMessage = (content: string) => {
    if (user && selectedDoctorId) {
      addMessage(user.id, selectedDoctorId, {
        senderId: user.id,
        senderRole: "patient",
        content,
      })
      handleRefresh()
    }
  }

  if (authLoading || !user || !patientData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Generate insights from patient data
  const insights = [
    {
      message: patientData.healthScore >= 70 
        ? t("recoveryImprovingSteadily")
        : patientData.healthScore >= 50 
          ? t("moderateProgress")
          : t("healthNeedsAttention"),
      type: patientData.healthScore >= 70 ? "positive" as const : "warning" as const,
    },
    {
      message: patientData.tookMedicineToday 
        ? t("medicineTakenToday")
        : t("rememberMedicine"),
      type: patientData.tookMedicineToday ? "positive" as const : "warning" as const,
    },
    {
      message: `${patientData.timeline.length} ${t("entriesLogged")}`,
      type: "positive" as const,
    },
  ]

  const patterns = [
    {
      pattern: patientData.currentCondition === "worse"
        ? t("recentDecline")
        : patientData.currentCondition === "better"
          ? t("positiveRecoveryTrend")
          : t("conditionStable"),
      severity: patientData.currentCondition === "worse" ? "high" as const : "low" as const,
    },
    {
      pattern: `${patientData.reports.length} ${t("reportsOnFile")}`,
      severity: "low" as const,
    },
  ]

  // Convert timeline to the format expected by Timeline component
  const timelineEntries = patientData.timeline.slice(0, 10).map(entry => ({
    id: entry.id,
    type: entry.type as "symptom" | "medicine" | "note",
    content: entry.content,
    date: entry.date,
    time: entry.time,
  }))

  // Get messages for selected doctor
  const currentMessages = selectedDoctorId 
    ? (patientData.messages[selectedDoctorId] || []).map(m => ({
        id: m.id,
        sender: m.senderRole,
        content: m.content,
        timestamp: new Date(m.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }))
    : []

  const renderContent = () => {
    switch (activeSection) {
      case "timeline":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("healthTimeline")}</h2>
            <Timeline entries={timelineEntries} />
          </div>
        )
      case "recovery":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("recoveryTracker")}</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <RecoveryFormV2 patientId={user.id} onSubmit={handleRefresh} />
              <RecoveryChart data={patientData.recoveryData} />
            </div>
            <Timeline entries={timelineEntries} />
          </div>
        )
      case "calendar":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("calendar")}</h2>
            <InteractiveCalendar calendarEvents={patientData.calendarEvents} />
          </div>
        )
      case "reports":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("reports")}</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <ReportUpload 
                patientId={user.id} 
                reports={patientData.reports}
                onReportAdded={handleRefresh}
              />
              <ImageUpload 
                patientId={user.id} 
                images={patientData.images}
                onImageAdded={handleRefresh}
              />
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {t("welcomeBack")}, {user.name.split(" ")[0]}!
                </h1>
                <p className="mt-1 text-muted-foreground">
                  {t("healthOverviewToday")}
                </p>
              </div>
            </div>

            {/* Main Grid - Responsive */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column - 8 cols */}
              <div className="space-y-6 lg:col-span-8">
                {/* Health Score & Insights Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <HealthScore score={patientData.healthScore} />
                  <InsightsCard
                    title={t("recentInsights")}
                    insights={insights}
                  />
                </div>
                
                {/* Recovery Chart */}
                <RecoveryChart data={patientData.recoveryData} />
                
                {/* Reports & Images Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <ReportUpload 
                    patientId={user.id} 
                    reports={patientData.reports}
                    onReportAdded={handleRefresh}
                  />
                  <ImageUpload 
                    patientId={user.id} 
                    images={patientData.images}
                    onImageAdded={handleRefresh}
                  />
                </div>

                {/* Timeline */}
                <Timeline entries={timelineEntries} />
              </div>

              {/* Right Column - 4 cols */}
              <div className="space-y-6 lg:col-span-4">
                {/* Emergency Alert */}
                <EmergencyAlertButton />
                
                {/* Recovery Form */}
                <RecoveryFormV2 patientId={user.id} onSubmit={handleRefresh} />
                
                {/* Pattern Detection */}
                <PatternDetection patterns={patterns} />
                
                {/* Doctor Selector */}
                <DoctorSelector
                  patientId={user.id}
                  patientCode={user.patientCode || ""}
                  doctors={doctors}
                  selectedDoctorId={selectedDoctorId}
                  onDoctorSelect={setSelectedDoctorId}
                  onDoctorAdded={handleRefresh}
                />
                
                {/* Chat Panel */}
                {selectedDoctorId && (
                  <Card className="overflow-hidden">
                    <CardHeader className="border-b pb-3">
                      <CardTitle className="text-base">{t("chatWithDoctor")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-[320px]">
                        <ChatPanel
                          messages={currentMessages}
                          patientName={user.name}
                          role="patient"
                          onSendMessage={handleSendMessage}
                          className="h-full border-0 rounded-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        role="patient"
        activeItem={activeSection}
        onItemClick={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col w-full min-h-0">
        <Header
          userName={user.name}
          role="patient"
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 w-full min-h-0">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default function PatientDashboard() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <PatientDashboardContent />
      </LanguageProvider>
    </AuthProvider>
  )
}
