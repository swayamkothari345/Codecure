export interface Patient {
  id: string
  name: string
  age: number
  status: "stable" | "warning" | "emergency"
  healthScore: number
  symptoms: string[]
  lastUpdated: string
  recoveryData: number[]
  messages: Message[]
}

export interface Message {
  id: string
  sender: "patient" | "doctor"
  content: string
  timestamp: string
}

export interface TimelineEntry {
  id: string
  type: "symptom" | "medicine" | "note"
  content: string
  date: string
  time: string
}

export interface CalendarEvent {
  date: number
  hasLog: boolean
  type?: "checkup" | "medicine" | "symptom"
}

export const patients: Patient[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    age: 45,
    status: "emergency",
    healthScore: 42,
    symptoms: ["Chest pain", "Shortness of breath", "Fatigue"],
    lastUpdated: "10 mins ago",
    recoveryData: [45, 52, 48, 42, 38, 42, 42],
    messages: [
      { id: "1", sender: "patient", content: "I am feeling severe chest pain since morning", timestamp: "10:30 AM" },
      { id: "2", sender: "doctor", content: "Please take the prescribed medication and rest. I will call you shortly.", timestamp: "10:35 AM" },
    ],
  },
  {
    id: "2",
    name: "Priya Patel",
    age: 32,
    status: "warning",
    healthScore: 68,
    symptoms: ["Mild headache", "Sleep issues"],
    lastUpdated: "1 hour ago",
    recoveryData: [55, 60, 65, 62, 68, 70, 68],
    messages: [
      { id: "1", sender: "patient", content: "The new medication is helping with sleep", timestamp: "9:00 AM" },
      { id: "2", sender: "doctor", content: "Great to hear! Continue the same dosage.", timestamp: "9:15 AM" },
    ],
  },
  {
    id: "3",
    name: "Amit Kumar",
    age: 58,
    status: "stable",
    healthScore: 85,
    symptoms: ["None"],
    lastUpdated: "3 hours ago",
    recoveryData: [70, 75, 78, 82, 85, 85, 85],
    messages: [
      { id: "1", sender: "patient", content: "Feeling much better now", timestamp: "8:00 AM" },
    ],
  },
  {
    id: "4",
    name: "Sneha Reddy",
    age: 28,
    status: "stable",
    healthScore: 92,
    symptoms: ["Minor cold"],
    lastUpdated: "5 hours ago",
    recoveryData: [80, 85, 88, 90, 91, 92, 92],
    messages: [],
  },
  {
    id: "5",
    name: "Vikram Singh",
    age: 67,
    status: "warning",
    healthScore: 55,
    symptoms: ["High blood pressure", "Dizziness"],
    lastUpdated: "30 mins ago",
    recoveryData: [60, 58, 55, 52, 55, 58, 55],
    messages: [
      { id: "1", sender: "patient", content: "Feeling dizzy after taking morning medication", timestamp: "11:00 AM" },
    ],
  },
]

export const patientTimeline: TimelineEntry[] = [
  { id: "1", type: "symptom", content: "Reported mild headache", date: "2024-01-15", time: "09:30 AM" },
  { id: "2", type: "medicine", content: "Took Paracetamol 500mg", date: "2024-01-15", time: "10:00 AM" },
  { id: "3", type: "note", content: "Felt better after rest", date: "2024-01-15", time: "02:00 PM" },
  { id: "4", type: "symptom", content: "Slight fatigue", date: "2024-01-14", time: "08:00 AM" },
  { id: "5", type: "medicine", content: "Vitamin D supplement", date: "2024-01-14", time: "08:30 AM" },
  { id: "6", type: "note", content: "Good energy levels in evening", date: "2024-01-13", time: "06:00 PM" },
]

export const calendarEvents: CalendarEvent[] = [
  { date: 3, hasLog: true, type: "medicine" },
  { date: 5, hasLog: true, type: "symptom" },
  { date: 8, hasLog: true, type: "checkup" },
  { date: 10, hasLog: true, type: "medicine" },
  { date: 12, hasLog: true, type: "medicine" },
  { date: 15, hasLog: true, type: "symptom" },
  { date: 18, hasLog: true, type: "checkup" },
  { date: 20, hasLog: true, type: "medicine" },
  { date: 22, hasLog: true, type: "medicine" },
]

export const currentPatient = {
  name: "Ananya Gupta",
  healthScore: 78,
  recoveryData: [60, 65, 68, 72, 75, 78, 78],
  assignedDoctor: {
    name: "Dr. Rajesh Mehta",
    specialization: "General Physician",
    status: "Available",
  },
  insights: [
    { message: "Recovery improving steadily", type: "positive" as const },
    { message: "Sleep pattern detected - irregular", type: "warning" as const },
    { message: "Medicine adherence: 85%", type: "positive" as const },
  ],
  patterns: [
    { pattern: "Recurring headache detected on weekday mornings", severity: "medium" as const },
    { pattern: "Energy levels peak in the afternoon", severity: "low" as const },
    { pattern: "Slight fatigue after meals", severity: "low" as const },
  ],
}
