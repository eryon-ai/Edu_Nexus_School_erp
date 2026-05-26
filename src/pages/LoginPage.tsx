import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { UserRole } from '../types'
import { GraduationCap, Sparkles, Zap } from 'lucide-react'
import { toast } from 'sonner'

const demoRoles: { value: UserRole; label: string; desc: string; color: string }[] = [
  { value: 'super_admin',       label: 'Super Admin',       desc: 'Full system access',   color: 'from-purple-500 to-indigo-600' },
  { value: 'school_admin',      label: 'School Admin',      desc: 'School management',    color: 'from-blue-500 to-cyan-600' },
  { value: 'teacher',           label: 'Teacher',           desc: 'Classes & grades',     color: 'from-emerald-500 to-teal-600' },
  { value: 'student',           label: 'Student',           desc: 'Academic portal',      color: 'from-amber-500 to-orange-600' },
  { value: 'parent',            label: 'Parent',            desc: 'Child monitoring',     color: 'from-pink-500 to-rose-600' },
  { value: 'accountant',        label: 'Accountant',        desc: 'Finance & fees',       color: 'from-slate-500 to-gray-600' },
]

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('school_admin')
  const [loading, setLoading] = useState(false)
  const { loginDemo } = useAppStore()
  const navigate = useNavigate()

  const handleDemoLogin = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    loginDemo(selectedRole)
    toast.success(`Demo mode — logged in as ${selectedRole.replace('_', ' ')}`)
    navigate('/dashboard')
    setLoading(false)
  }

  const floatingCards = [
    { top: '12%', left: '8%',   delay: 0,   label: '2,847 Students',    sub: 'Enrolled this year' },
    { top: '52%', right: '6%',  delay: 0.3, label: '98.2% Attendance',  sub: 'This week average' },
    { bottom: '15%', left: '12%', delay: 0.6, label: '₹4.2Cr Collected', sub: 'Fee collection Q4' },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left branding panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[48%] relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#2563eb 100%)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%,rgba(255,255,255,.08) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(255,255,255,.06) 0%,transparent 50%)' }} />

        {floatingCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ delay: card.delay, duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bg-white/15 backdrop-blur-md border border-white/25 rounded-xl p-3.5 shadow-2xl"
            style={{ top: card.top, left: (card as any).left, right: (card as any).right, bottom: card.bottom }}>
            <p className="text-white font-bold text-sm">{card.label}</p>
            <p className="text-white/70 text-xs">{card.sub}</p>
          </motion.div>
        ))}

        <div className="relative text-center text-white px-12">
          <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-2xl">
            <GraduationCap className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-4xl font-bold font-display mb-2">EduNexus ERP</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="text-white/75 text-lg">Enterprise School Management Platform</motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="mt-8 flex items-center justify-center gap-2 text-white/55 text-sm">
            <Sparkles className="h-4 w-4" /><span>Trusted by 500+ schools across India</span>
          </motion.div>

          {/* Demo badge */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
            className="mt-6 inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-yellow-300" />
            <span className="text-xs text-white/80 font-medium">Demo Mode</span>
            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          </motion.div>
        </div>
      </div>

      {/* ── Right login panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden mb-6">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold font-display text-gradient">EduNexus ERP</span>
          </div>

          <div className="mb-5 sm:mb-7">
            <h2 className="text-xl sm:text-2xl font-bold font-display">Welcome to EduNexus</h2>
            <p className="text-sm text-muted-foreground mt-1">Select a role to explore the ERP demo</p>
          </div>

          {/* Role selection — always demo mode */}
          <>
            <p className="text-xs text-muted-foreground mb-3 font-medium">Choose your role to preview the system</p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {demoRoles.map(role => (
                <button key={role.value} onClick={() => setSelectedRole(role.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-150 ${selectedRole === role.value ? 'border-primary bg-accent shadow-sm' : 'border-border hover:border-border/60 hover:bg-accent/40'}`}>
                  <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${role.color} mb-2`} />
                  <p className="text-xs font-semibold">{role.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{role.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={handleDemoLogin} disabled={loading}
              className="w-full h-11 gradient-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60 shadow-sm">
              {loading
                ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Zap className="h-4 w-4" /><span>Enter as {selectedRole.replace('_', ' ')}</span></>}
            </button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              This is a demo — no credentials required
            </p>
          </>
        </motion.div>
      </div>
    </div>
  )
}
