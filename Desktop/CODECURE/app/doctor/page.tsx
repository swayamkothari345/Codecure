"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { EmergencyAlertsList } from "@/components/alerts"
import { PatientDetailView } from "@/components/patient-detail-view"
import { AddPatientDialog } from "@/components/add-patient-dialog"
import { 
  getConnectedPatientsWithData, 
  getDoctorData,
  addMessage,
  PatientData,
} from "@/lib/data-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Loader2,
  Search,
  UserPlus,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface ConnectedPatient {
  id: string
  name: string
  email: string
  data: PatientData
  status: "stable" | "warning" | "emergency"
}

function DoctorDashboardContent() {
  const { t } = useLanguage()
  const { user, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()
  
  const [activeSection, setActiveSection] = useState("patients")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [patients, setPatients] = useState<ConnectedPatient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<ConnectedPatient | null>(null)
  const [showPatientDetail, setShowPatientDetail] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  // Load patients data
  const loadData = useCallback(() => {
    if (user) {
      const connectedPatients = getConnectedPatientsWithData(user.id)
      setPatients(connectedPatients)
      if (connectedPatients.length > 0 && !selectedPatient) {
        setSelectedPatient(connectedPatients[0])
      }
    }
  }, [user, selectedPatient])

  useEffect(() => {
    loadData()
  }, [loadData, refreshKey])

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    } else if (!authLoading && user && user.role !== "doctor") {
      router.push("/patient")
    }
  }, [user, authLoading, router])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleSendMessage = (patientId: string, content: string) => {
    if (user) {
      addMessage(patientId, user.id, {
        senderId: user.id,
        senderRole: "doctor",
        content,
      })
      handleRefresh()
    }
  }

  const handleViewPatientDetail = (patient: ConnectedPatient) => {
    setSelectedPatient(patient)
    setShowPatientDetail(true)
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Filter patients by search query
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get emergency alerts
  const emergencyAlerts = patients
    .filter((p) => p.status === "emergency")
    .map((p) => ({
      id: p.id,
      patientName: p.name,
      message: p.data.timeline[0]?.content || "Emergency status",
      time: new Date(p.data.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }))

  // Status counts
  const statusCounts = {
    stable: patients.filter((p) => p.status === "stable").length,
    warning: patients.filter((p) => p.status === "warning").length,
    emergency: patients.filter((p) => p.status === "emergency").length,
  }

  const renderPatientList = () => (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t("patientList")} ({patients.length})
          </CardTitle>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPatients")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">
              {patients.length === 0 ? t("noPatientsConnected") : t("noPatientsFound")}
            </p>
            {patients.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("addPatientsButton")}
              </p>
            )}
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => handleViewPatientDetail(patient)}
              className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:bg-muted/50 ${
                selectedPatient?.id === patient.id && !showPatientDetail
                  ? "border-primary bg-primary/5"
                  : ""
              } ${
                patient.status === "emergency" ? "border-destructive/50" : ""
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  patient.status === "emergency"
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : patient.status === "warning"
                    ? "bg-warning text-warning-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {patient.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{patient.name}</p>
                  {patient.status === "emergency" && (
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Score: {patient.data.healthScore} | {patient.status}
                </p>
              </div>
              <Badge
                className={`shrink-0 ${
                  patient.status === "emergency"
                    ? "bg-destructive text-destructive-foreground"
                    : patient.status === "warning"
                    ? "bg-warning text-warning-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {patient.data.healthScore}
              </Badge>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  )

  const renderContent = () => {
    // Show patient detail view
    if (showPatientDetail && selectedPatient) {
      return (
        <PatientDetailView
          patient={selectedPatient}
          onBack={() => setShowPatientDetail(false)}
          onSendMessage={(content) => handleSendMessage(selectedPatient.id, content)}
        />
      )
    }

    switch (activeSection) {
      case "alerts":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("emergencyAlerts")}</h2>
            {emergencyAlerts.length > 0 ? (
              <EmergencyAlertsList alerts={emergencyAlerts} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No emergency alerts</p>
                  <p className="text-sm text-muted-foreground">All patients are in stable condition</p>
                </CardContent>
              </Card>
            )}
            
            {/* Warning patients */}
            <h3 className="text-lg font-semibold mt-8">{t("warningStatusPatients")}</h3>
            {patients.filter(p => p.status === "warning").length > 0 ? (
              <div className="space-y-3">
                {patients
                  .filter((p) => p.status === "warning")
                  .map((patient) => (
                    <Card key={patient.id} className="border-warning/30">
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning text-warning-foreground">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t("healthScore")}: {patient.data.healthScore}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewPatientDetail(patient)}
                        >
                          {t("viewDetails")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t("noPatientsWarning")}</p>
            )}
          </div>
        )
      case "overview":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("overview")}</h2>
            
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{patients.length}</p>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statusCounts.emergency}</p>
                    <p className="text-sm text-muted-foreground">Emergency</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statusCounts.stable}</p>
                    <p className="text-sm text-muted-foreground">Stable</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patient Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{t("patientHealthScores")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    {t("noPatientsYet")}
                  </p>
                ) : (
                  patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleViewPatientDetail(patient)}
                      className="w-full space-y-2 rounded-lg p-2 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{patient.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {patient.data.healthScore}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            patient.data.healthScore >= 70
                              ? "bg-primary"
                              : patient.data.healthScore >= 50
                              ? "bg-warning"
                              : "bg-destructive"
                          }`}
                          style={{ width: `${patient.data.healthScore}%` }}
                        />
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Welcome, {user.name}
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Manage your patients and monitor their health
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <AddPatientDialog doctorId={user.id} onPatientAdded={handleRefresh} />
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1 py-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {statusCounts.stable} Stable
                  </Badge>
                  <Badge variant="outline" className="gap-1 py-2">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    {statusCounts.warning} Warning
                  </Badge>
                  <Badge variant="outline" className="gap-1 py-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    {statusCounts.emergency} Emergency
                  </Badge>
                </div>
              </div>
            </div>

            {/* Emergency Alerts */}
            {emergencyAlerts.length > 0 && (
              <EmergencyAlertsList alerts={emergencyAlerts} />
            )}

            {/* Main Content */}
            {patients.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <UserPlus className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Patients Yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Start by adding patients to your dashboard. You can generate a code for them to connect or enter their patient code directly.
                  </p>
                  <AddPatientDialog doctorId={user.id} onPatientAdded={handleRefresh} />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Patient List */}
                <div className="lg:col-span-1">
                  {renderPatientList()}
                </div>

                {/* Quick Overview */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedPatient && !showPatientDetail && (
                    <>
                      {/* Quick Patient Info */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ${
                                  selectedPatient.status === "emergency"
                                    ? "bg-destructive text-destructive-foreground"
                                    : selectedPatient.status === "warning"
                                    ? "bg-warning text-warning-foreground"
                                    : "bg-primary/10 text-primary"
                                }`}
                              >
                                {selectedPatient.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                                <p className="text-muted-foreground">{selectedPatient.email}</p>
                              </div>
                            </div>
                            <Button onClick={() => handleViewPatientDetail(selectedPatient)}>
                              {t("viewFullDetails")}
                            </Button>
                          </div>
                          
                          <div className="grid gap-4 sm:grid-cols-4">
                            <div className="rounded-xl bg-primary/5 p-4 text-center">
                              <p className="text-2xl font-bold text-primary">
                                {selectedPatient.data.healthScore}
                              </p>
                              <p className="text-xs text-muted-foreground">{t("healthScore")}</p>
                            </div>
                            <div className="rounded-xl bg-muted p-4 text-center">
                              <p className="text-2xl font-bold">
                                {selectedPatient.data.timeline.length}
                              </p>
                              <p className="text-xs text-muted-foreground">{t("entries")}</p>
                            </div>
                            <div className="rounded-xl bg-muted p-4 text-center">
                              <p className="text-2xl font-bold">
                                {selectedPatient.data.reports.length}
                              </p>
                              <p className="text-xs text-muted-foreground">{t("reports")}</p>
                            </div>
                            <div className="rounded-xl bg-muted p-4 text-center">
                              <Badge
                                className={
                                  selectedPatient.status === "emergency"
                                    ? "bg-destructive text-destructive-foreground"
                                    : selectedPatient.status === "warning"
                                    ? "bg-warning text-warning-foreground"
                                    : "bg-primary text-primary-foreground"
                                }
                              >
                                {selectedPatient.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-2">Status</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Activity */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {selectedPatient.data.timeline.slice(0, 5).map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-start gap-3 rounded-lg border p-3"
                            >
                              <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                                entry.type === "symptom" ? "bg-destructive" :
                                entry.type === "medicine" ? "bg-primary" :
                                "bg-muted-foreground"
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{entry.content}</p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.date} at {entry.time}
                                </p>
                              </div>
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {entry.type}
                              </Badge>
                            </div>
                          ))}
                          {selectedPatient.data.timeline.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-4">
                              No activity yet
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        role="doctor"
        activeItem={activeSection}
        onItemClick={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col w-full min-h-0">
        <Header
          userName={user.name}
          role="doctor"
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

export default function DoctorDashboard() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <DoctorDashboardContent />
      </LanguageProvider>
    </AuthProvider>
  )
}
