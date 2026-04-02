// Data store with localStorage persistence

export interface TimelineEntry {
  id: string
  type: "symptom" | "medicine" | "note" | "report" | "image"
  content: string
  date: string
  time: string
  condition?: "better" | "same" | "worse"
}

export interface CalendarEvent {
  date: string // YYYY-MM-DD
  entries: TimelineEntry[]
  overallStatus: "good" | "improving" | "worsening"
}

export interface Report {
  id: string
  name: string
  type: "pdf" | "image"
  uploadedAt: string
  url: string
  aiSummary?: {
    problem: string
    abnormalValues: string[]
    suggestions: string[]
  }
}

export interface ConditionImage {
  id: string
  url: string
  uploadedAt: string
  note: string
}

export interface Message {
  id: string
  senderId: string
  senderRole: "patient" | "doctor"
  content: string
  timestamp: string
}

export interface PatientData {
  healthScore: number
  recoveryData: number[]
  timeline: TimelineEntry[]
  calendarEvents: Record<string, CalendarEvent>
  reports: Report[]
  images: ConditionImage[]
  messages: Record<string, Message[]> // keyed by doctor ID
  connectedDoctors: string[]
  tookMedicineToday: boolean
  currentCondition: "better" | "same" | "worse" | null
  lastUpdated: string
}

export interface DoctorData {
  connectedPatients: string[]
  generatedCodes: string[]
}

// Patient Data Operations
export function getPatientData(patientId: string): PatientData {
  const key = `curaithm_patient_${patientId}`
  const data = localStorage.getItem(key)
  if (data) {
    return JSON.parse(data)
  }
  // Return default data
  const defaultData: PatientData = {
    healthScore: 75,
    recoveryData: [70, 72, 74, 73, 75, 75, 75],
    timeline: [],
    calendarEvents: {},
    reports: [],
    images: [],
    messages: {},
    connectedDoctors: [],
    tookMedicineToday: false,
    currentCondition: null,
    lastUpdated: new Date().toISOString(),
  }
  localStorage.setItem(key, JSON.stringify(defaultData))
  return defaultData
}

export function savePatientData(patientId: string, data: Partial<PatientData>) {
  const key = `curaithm_patient_${patientId}`
  const existing = getPatientData(patientId)
  const updated = { ...existing, ...data, lastUpdated: new Date().toISOString() }
  localStorage.setItem(key, JSON.stringify(updated))
  return updated
}

export function addTimelineEntry(patientId: string, entry: Omit<TimelineEntry, "id">) {
  const data = getPatientData(patientId)
  const newEntry: TimelineEntry = {
    ...entry,
    id: crypto.randomUUID(),
  }
  data.timeline.unshift(newEntry)
  
  // Also add to calendar events
  const dateKey = entry.date
  if (!data.calendarEvents[dateKey]) {
    data.calendarEvents[dateKey] = {
      date: dateKey,
      entries: [],
      overallStatus: "good",
    }
  }
  data.calendarEvents[dateKey].entries.push(newEntry)
  
  // Update overall status based on condition
  if (entry.condition) {
    data.calendarEvents[dateKey].overallStatus = 
      entry.condition === "worse" ? "worsening" :
      entry.condition === "better" ? "improving" : "good"
  }
  
  savePatientData(patientId, data)
  return newEntry
}

export function updateRecoveryData(patientId: string, newScore: number) {
  const data = getPatientData(patientId)
  data.recoveryData = [...data.recoveryData.slice(1), newScore]
  data.healthScore = newScore
  savePatientData(patientId, data)
}

export function addReport(patientId: string, report: Omit<Report, "id">) {
  const data = getPatientData(patientId)
  const newReport: Report = {
    ...report,
    id: crypto.randomUUID(),
  }
  data.reports.unshift(newReport)
  savePatientData(patientId, data)
  return newReport
}

export function addConditionImage(patientId: string, image: Omit<ConditionImage, "id">) {
  const data = getPatientData(patientId)
  const newImage: ConditionImage = {
    ...image,
    id: crypto.randomUUID(),
  }
  data.images.unshift(newImage)
  savePatientData(patientId, data)
  return newImage
}

export function addMessage(patientId: string, doctorId: string, message: Omit<Message, "id" | "timestamp">) {
  const data = getPatientData(patientId)
  if (!data.messages[doctorId]) {
    data.messages[doctorId] = []
  }
  const newMessage: Message = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  }
  data.messages[doctorId].push(newMessage)
  savePatientData(patientId, data)
  return newMessage
}

// Doctor Data Operations
export function getDoctorData(doctorId: string): DoctorData {
  const key = `curaithm_doctor_${doctorId}`
  const data = localStorage.getItem(key)
  if (data) {
    return JSON.parse(data)
  }
  const defaultData: DoctorData = {
    connectedPatients: [],
    generatedCodes: [],
  }
  localStorage.setItem(key, JSON.stringify(defaultData))
  return defaultData
}

export function saveDoctorData(doctorId: string, data: Partial<DoctorData>) {
  const key = `curaithm_doctor_${doctorId}`
  const existing = getDoctorData(doctorId)
  const updated = { ...existing, ...data }
  localStorage.setItem(key, JSON.stringify(updated))
  return updated
}

export function generateDoctorCode(doctorId: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "DR-"
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Save code mapping
  const codesKey = "curaithm_doctor_codes"
  const codes: Record<string, string> = JSON.parse(localStorage.getItem(codesKey) || "{}")
  codes[code] = doctorId
  localStorage.setItem(codesKey, JSON.stringify(codes))
  
  // Track in doctor data
  const doctorData = getDoctorData(doctorId)
  doctorData.generatedCodes.push(code)
  saveDoctorData(doctorId, doctorData)
  
  return code
}

export function connectPatientToDoctor(patientId: string, doctorCode: string): { success: boolean; error?: string } {
  const codesKey = "curaithm_doctor_codes"
  const codes: Record<string, string> = JSON.parse(localStorage.getItem(codesKey) || "{}")
  
  const doctorId = codes[doctorCode]
  if (!doctorId) {
    return { success: false, error: "Invalid doctor code" }
  }
  
  // Update patient data
  const patientData = getPatientData(patientId)
  if (!patientData.connectedDoctors.includes(doctorId)) {
    patientData.connectedDoctors.push(doctorId)
    savePatientData(patientId, patientData)
  }
  
  // Update doctor data
  const doctorData = getDoctorData(doctorId)
  if (!doctorData.connectedPatients.includes(patientId)) {
    doctorData.connectedPatients.push(patientId)
    saveDoctorData(doctorId, doctorData)
  }
  
  return { success: true }
}

export function connectDoctorToPatient(doctorId: string, patientCode: string): { success: boolean; error?: string; patientId?: string } {
  // Find patient by code
  const usersStr = localStorage.getItem("curaithm_users")
  const users: Record<string, { user: { id: string; patientCode?: string; role: string } }> = usersStr ? JSON.parse(usersStr) : {}
  
  let patientId: string | null = null
  for (const email in users) {
    const userData = users[email]
    if (userData.user.role === "patient" && userData.user.patientCode === patientCode) {
      patientId = userData.user.id
      break
    }
  }
  
  if (!patientId) {
    return { success: false, error: "Invalid patient code" }
  }
  
  // Update doctor data
  const doctorData = getDoctorData(doctorId)
  if (!doctorData.connectedPatients.includes(patientId)) {
    doctorData.connectedPatients.push(patientId)
    saveDoctorData(doctorId, doctorData)
  }
  
  // Update patient data
  const patientData = getPatientData(patientId)
  if (!patientData.connectedDoctors.includes(doctorId)) {
    patientData.connectedDoctors.push(doctorId)
    savePatientData(patientId, patientData)
  }
  
  return { success: true, patientId }
}

// Get user by ID
export function getUserById(userId: string) {
  const usersStr = localStorage.getItem("curaithm_users")
  const users: Record<string, { user: { id: string; name: string; email: string; role: string; patientCode?: string } }> = usersStr ? JSON.parse(usersStr) : {}
  
  for (const email in users) {
    if (users[email].user.id === userId) {
      return users[email].user
    }
  }
  return null
}

// Get all connected patients for a doctor with their data
export function getConnectedPatientsWithData(doctorId: string) {
  const doctorData = getDoctorData(doctorId)
  const patients: Array<{
    id: string
    name: string
    email: string
    data: PatientData
    status: "stable" | "warning" | "emergency"
  }> = []
  
  for (const patientId of doctorData.connectedPatients) {
    const user = getUserById(patientId)
    if (user) {
      const data = getPatientData(patientId)
      let status: "stable" | "warning" | "emergency" = "stable"
      if (data.healthScore < 50) {
        status = "emergency"
      } else if (data.healthScore < 70) {
        status = "warning"
      }
      
      patients.push({
        id: patientId,
        name: user.name,
        email: user.email,
        data,
        status,
      })
    }
  }
  
  // Sort by status (emergency first)
  patients.sort((a, b) => {
    const order = { emergency: 0, warning: 1, stable: 2 }
    return order[a.status] - order[b.status]
  })
  
  return patients
}

// Get connected doctors for a patient
export function getConnectedDoctors(patientId: string) {
  const patientData = getPatientData(patientId)
  const doctors: Array<{ id: string; name: string; email: string }> = []
  
  for (const doctorId of patientData.connectedDoctors) {
    const user = getUserById(doctorId)
    if (user) {
      doctors.push({
        id: doctorId,
        name: user.name,
        email: user.email,
      })
    }
  }
  
  return doctors
}

// Generate AI summary for a patient
export function generateAISummary(patientId: string) {
  const data = getPatientData(patientId)
  const user = getUserById(patientId)
  
  // Analyze recovery trend
  const recentScores = data.recoveryData.slice(-7)
  const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
  const trend = recentScores[recentScores.length - 1] - recentScores[0]
  
  // Count medicine adherence
  const last7Days = data.timeline.filter(e => {
    const entryDate = new Date(e.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return entryDate >= weekAgo && e.type === "medicine"
  })
  const adherence = Math.min(100, Math.round((last7Days.length / 7) * 100))
  
  // Get recent symptoms
  const recentSymptoms = data.timeline
    .filter(e => e.type === "symptom")
    .slice(0, 3)
    .map(e => e.content)
  
  // Determine risk level
  let riskLevel: "low" | "medium" | "high" = "low"
  if (data.healthScore < 50) {
    riskLevel = "high"
  } else if (data.healthScore < 70 || trend < 0) {
    riskLevel = "medium"
  }
  
  return {
    patientName: user?.name || "Patient",
    currentProblem: recentSymptoms.length > 0 ? recentSymptoms.join(", ") : "No recent symptoms reported",
    recoveryStatus: trend > 5 ? "Improving steadily" : trend > 0 ? "Slight improvement" : trend === 0 ? "Stable" : "Declining",
    patternDetection: data.healthScore < 70 
      ? "Recurring low health scores detected" 
      : trend < 0 
        ? "Downward trend in recent days" 
        : "No concerning patterns",
    medicationAdherence: `${adherence}% adherence in last 7 days`,
    medicalHistory: `${data.timeline.length} entries logged, ${data.reports.length} reports uploaded`,
    riskLevel,
    suggestedAction: riskLevel === "high" 
      ? "Immediate follow-up recommended" 
      : riskLevel === "medium" 
        ? "Schedule check-up within 2-3 days" 
        : "Continue monitoring, no urgent action needed",
    healthScore: data.healthScore,
    lastUpdated: data.lastUpdated,
  }
}

// Generate AI report summary
export function generateReportAISummary(): Report["aiSummary"] {
  // Simulated AI analysis - in production this would use actual AI
  const problems = [
    "Elevated blood glucose levels",
    "Mild vitamin D deficiency", 
    "Slightly elevated blood pressure",
    "Minor inflammation markers",
  ]
  const abnormalValues = [
    "HbA1c: 6.8% (slightly elevated)",
    "Vitamin D: 22 ng/mL (low)",
    "BP: 135/85 mmHg (pre-hypertension)",
  ]
  const suggestions = [
    "Maintain balanced diet with reduced sugar intake",
    "Consider vitamin D supplementation",
    "Regular exercise recommended",
    "Follow-up blood work in 3 months",
  ]
  
  return {
    problem: problems[Math.floor(Math.random() * problems.length)],
    abnormalValues: abnormalValues.slice(0, Math.floor(Math.random() * 3) + 1),
    suggestions: suggestions.slice(0, Math.floor(Math.random() * 3) + 2),
  }
}

// Seed demo data for testing
export function seedDemoData() {
  // Check if already seeded
  if (localStorage.getItem("curaithm_demo_seeded")) {
    return
  }
  
  // Create demo doctor
  const demoDoctor = {
    id: "demo-doctor-1",
    name: "Dr. Rajesh Mehta",
    email: "doctor@demo.com",
    role: "doctor" as const,
    createdAt: new Date().toISOString(),
    connectedPatients: ["demo-patient-1", "demo-patient-2", "demo-patient-3"],
  }
  
  // Create demo patients
  const demoPatients = [
    {
      id: "demo-patient-1",
      name: "Rahul Sharma",
      email: "rahul@demo.com",
      role: "patient" as const,
      createdAt: new Date().toISOString(),
      connectedDoctors: ["demo-doctor-1"],
      patientCode: "RSH001",
    },
    {
      id: "demo-patient-2",
      name: "Priya Patel",
      email: "priya@demo.com",
      role: "patient" as const,
      createdAt: new Date().toISOString(),
      connectedDoctors: ["demo-doctor-1"],
      patientCode: "PPT002",
    },
    {
      id: "demo-patient-3",
      name: "Amit Kumar",
      email: "amit@demo.com",
      role: "patient" as const,
      createdAt: new Date().toISOString(),
      connectedDoctors: ["demo-doctor-1"],
      patientCode: "AKM003",
    },
  ]
  
  // Save users
  const users: Record<string, { user: typeof demoDoctor | typeof demoPatients[0]; password: string }> = {
    "doctor@demo.com": { user: demoDoctor, password: "demo123" },
    "rahul@demo.com": { user: demoPatients[0], password: "demo123" },
    "priya@demo.com": { user: demoPatients[1], password: "demo123" },
    "amit@demo.com": { user: demoPatients[2], password: "demo123" },
  }
  localStorage.setItem("curaithm_users", JSON.stringify(users))
  
  // Save doctor data
  const doctorData: DoctorData = {
    connectedPatients: ["demo-patient-1", "demo-patient-2", "demo-patient-3"],
    generatedCodes: ["DR-DEMO01"],
  }
  localStorage.setItem("curaithm_doctor_demo-doctor-1", JSON.stringify(doctorData))
  
  // Save patient data with realistic entries
  const today = new Date()
  const patientDataSets: PatientData[] = [
    {
      healthScore: 42,
      recoveryData: [45, 52, 48, 42, 38, 42, 42],
      timeline: [
        { id: "1", type: "symptom", content: "Severe chest pain since morning", date: today.toISOString().split("T")[0], time: "10:30 AM", condition: "worse" },
        { id: "2", type: "medicine", content: "Took prescribed heart medication", date: today.toISOString().split("T")[0], time: "11:00 AM" },
        { id: "3", type: "symptom", content: "Shortness of breath", date: new Date(today.getTime() - 86400000).toISOString().split("T")[0], time: "08:00 AM", condition: "worse" },
      ],
      calendarEvents: {},
      reports: [],
      images: [],
      messages: {
        "demo-doctor-1": [
          { id: "m1", senderId: "demo-patient-1", senderRole: "patient", content: "I am feeling severe chest pain since morning", timestamp: new Date(today.getTime() - 3600000).toISOString() },
          { id: "m2", senderId: "demo-doctor-1", senderRole: "doctor", content: "Please take the prescribed medication and rest. I will call you shortly.", timestamp: new Date(today.getTime() - 3300000).toISOString() },
        ],
      },
      connectedDoctors: ["demo-doctor-1"],
      tookMedicineToday: true,
      currentCondition: "worse",
      lastUpdated: today.toISOString(),
    },
    {
      healthScore: 68,
      recoveryData: [55, 60, 65, 62, 68, 70, 68],
      timeline: [
        { id: "1", type: "symptom", content: "Mild headache", date: today.toISOString().split("T")[0], time: "09:00 AM", condition: "same" },
        { id: "2", type: "medicine", content: "Took sleep medication", date: today.toISOString().split("T")[0], time: "09:30 PM" },
        { id: "3", type: "note", content: "Sleep quality improving", date: new Date(today.getTime() - 86400000).toISOString().split("T")[0], time: "08:00 AM" },
      ],
      calendarEvents: {},
      reports: [],
      images: [],
      messages: {
        "demo-doctor-1": [
          { id: "m1", senderId: "demo-patient-2", senderRole: "patient", content: "The new medication is helping with sleep", timestamp: new Date(today.getTime() - 7200000).toISOString() },
          { id: "m2", senderId: "demo-doctor-1", senderRole: "doctor", content: "Great to hear! Continue the same dosage.", timestamp: new Date(today.getTime() - 6900000).toISOString() },
        ],
      },
      connectedDoctors: ["demo-doctor-1"],
      tookMedicineToday: true,
      currentCondition: "same",
      lastUpdated: today.toISOString(),
    },
    {
      healthScore: 85,
      recoveryData: [70, 75, 78, 82, 85, 85, 85],
      timeline: [
        { id: "1", type: "note", content: "Feeling much better now", date: today.toISOString().split("T")[0], time: "08:00 AM", condition: "better" },
        { id: "2", type: "medicine", content: "Completed medication course", date: new Date(today.getTime() - 86400000).toISOString().split("T")[0], time: "09:00 AM" },
      ],
      calendarEvents: {},
      reports: [],
      images: [],
      messages: {
        "demo-doctor-1": [
          { id: "m1", senderId: "demo-patient-3", senderRole: "patient", content: "Feeling much better now, thank you doctor!", timestamp: new Date(today.getTime() - 10800000).toISOString() },
        ],
      },
      connectedDoctors: ["demo-doctor-1"],
      tookMedicineToday: true,
      currentCondition: "better",
      lastUpdated: today.toISOString(),
    },
  ]
  
  demoPatients.forEach((patient, index) => {
    localStorage.setItem(`curaithm_patient_${patient.id}`, JSON.stringify(patientDataSets[index]))
  })
  
  // Save doctor codes
  localStorage.setItem("curaithm_doctor_codes", JSON.stringify({ "DR-DEMO01": "demo-doctor-1" }))
  
  localStorage.setItem("curaithm_demo_seeded", "true")
}
