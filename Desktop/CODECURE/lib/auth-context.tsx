"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface User {
  id: string
  name: string
  email: string
  role: "patient" | "doctor"
  createdAt: string
  connectedDoctors?: string[] // For patients
  patientCode?: string // For patients to share with doctors
  connectedPatients?: string[] // For doctors
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string, role: "patient" | "doctor") => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Generate a unique patient code
function generatePatientCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("curaithm_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Get users from localStorage
    const usersStr = localStorage.getItem("curaithm_users")
    const users: Record<string, { user: User; password: string }> = usersStr ? JSON.parse(usersStr) : {}

    const userData = users[email]
    if (!userData) {
      return { success: false, error: "No account found with this email" }
    }

    if (userData.password !== password) {
      return { success: false, error: "Incorrect password" }
    }

    setUser(userData.user)
    localStorage.setItem("curaithm_user", JSON.stringify(userData.user))
    return { success: true }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: "patient" | "doctor"
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Get users from localStorage
    const usersStr = localStorage.getItem("curaithm_users")
    const users: Record<string, { user: User; password: string }> = usersStr ? JSON.parse(usersStr) : {}

    if (users[email]) {
      return { success: false, error: "An account with this email already exists" }
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      ...(role === "patient" && {
        connectedDoctors: [],
        patientCode: generatePatientCode(),
      }),
      ...(role === "doctor" && {
        connectedPatients: [],
      }),
    }

    users[email] = { user: newUser, password }
    localStorage.setItem("curaithm_users", JSON.stringify(users))
    
    // Also initialize patient/doctor specific data
    if (role === "patient") {
      initializePatientData(newUser.id)
    }

    setUser(newUser)
    localStorage.setItem("curaithm_user", JSON.stringify(newUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("curaithm_user")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Initialize default patient data
function initializePatientData(patientId: string) {
  const patientDataKey = `curaithm_patient_${patientId}`
  const existingData = localStorage.getItem(patientDataKey)
  
  if (!existingData) {
    const initialData = {
      healthScore: 75,
      recoveryData: [70, 72, 74, 73, 75, 75, 75],
      timeline: [],
      calendarEvents: {},
      reports: [],
      images: [],
      messages: {},
    }
    localStorage.setItem(patientDataKey, JSON.stringify(initialData))
  }
}
