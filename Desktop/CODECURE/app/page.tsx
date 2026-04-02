"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { seedDemoData } from "@/lib/data-store"
import { LanguageToggle } from "@/components/language-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Stethoscope, 
  HeartPulse, 
  Activity, 
  Brain, 
  Shield,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react"

function LoginContent() {
  const { t } = useLanguage()
  const { login, signup, user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [role, setRole] = useState<"patient" | "doctor">("patient")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  // Form fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Seed demo data on mount
  useEffect(() => {
    seedDemoData()
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push(user.role === "doctor" ? "/doctor" : "/patient")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (mode === "login") {
        const result = await login(email, password)
        if (!result.success) {
          setError(result.error || "Login failed")
        }
      } else {
        const result = await signup(name, email, password, role)
        if (!result.success) {
          setError(result.error || "Signup failed")
        }
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = (type: "doctor" | "patient") => {
    if (type === "doctor") {
      setEmail("doctor@demo.com")
      setPassword("demo123")
    } else {
      setEmail("rahul@demo.com")
      setPassword("demo123")
    }
    setMode("login")
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 lg:block">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10" />
          <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-white/5" />
        </div>
        
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-primary-foreground">
          {/* Logo */}
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 shadow-2xl backdrop-blur-sm">
            <HeartPulse className="h-12 w-12" />
          </div>
          
          <h1 className="mb-4 text-5xl font-bold tracking-tight">Curaithm</h1>
          <p className="mb-12 text-xl text-primary-foreground/90">
            {t("tagline")}
          </p>
          
          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">{t("realTimeMonitoring")}</h3>
                <p className="text-sm text-primary-foreground/80">{t("trackHealthMetrics")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">{t("aiPoweredInsights")}</h3>
                <p className="text-sm text-primary-foreground/80">{t("intelligentHealthAnalysis")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">{t("securePrivate")}</h3>
                <p className="text-sm text-primary-foreground/80">{t("yourDataProtected")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Curaithm</span>
          </div>
          <div className="ml-auto">
            <LanguageToggle />
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">
                {mode === "login" ? t("welcomeBack") : t("createAccount")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {mode === "login" 
                  ? t("signInContinue") 
                  : t("signUpStart")}
              </p>
            </div>

            {/* Demo Credentials */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t("demoAccounts")}</p>
                  <p className="text-xs text-muted-foreground">{t("tryPrefilledData")}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fillDemoCredentials("patient")}
                    className="gap-1"
                  >
                    <User className="h-3 w-3" />
                    {t("patient")}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fillDemoCredentials("doctor")}
                    className="gap-1"
                  >
                    <Stethoscope className="h-3 w-3" />
                    {t("doctor")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auth Tabs */}
            <Tabs value={mode} onValueChange={(v) => { setMode(v as "login" | "signup"); setError("") }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("login")}</TabsTrigger>
                <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("enterYourEmail")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t("password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("enterYourPassword")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t("signIn")}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label>{t("iAmA")}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("patient")}
                        className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                          role === "patient"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          role === "patient" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <User className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{t("patient")}</p>
                          <p className="text-xs text-muted-foreground">{t("trackMyHealth")}</p>
                        </div>
                        {role === "patient" && (
                          <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setRole("doctor")}
                        className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                          role === "doctor"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          role === "doctor" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{t("doctor")}</p>
                          <p className="text-xs text-muted-foreground">{t("managePatients")}</p>
                        </div>
                        {role === "doctor" && (
                          <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">{t("fullName")}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("enterYourName")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t("email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t("enterYourEmail")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t("password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("createPassword")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t("createAccount")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-center text-sm text-muted-foreground">
              {t("termsAgreement")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <LoginContent />
      </LanguageProvider>
    </AuthProvider>
  )
}
