import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Activity, ShieldAlert } from 'lucide-react'

export default function Header() {
    const [health, setHealth] = useState(null)

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const r = await fetch('/health')
                const d = await r.json()
                setHealth(d)
            } catch { setHealth(null) }
        }
        fetchHealth()
        const i = setInterval(fetchHealth, 10000)
        return () => clearInterval(i)
    }, [])

    return (
        <header className="h-[var(--nav-height)] border-b border-white/5 backdrop-blur-md sticky top-0 z-[100] bg-black/20">
            <div className="container h-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.3)]">
                        <Zap size={22} className="text-black fill-black" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter">Margintel</h1>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Intelligence Layer 0.1</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${health?.ok ? 'bg-primary' : 'bg-accent'}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {health?.ok ? (health?.llm_available ? 'Engine Ready' : 'Core Only') : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>
            <style>{`
        .h-\\[var\\(--nav-height\\)\\] { height: var(--nav-height); }
        .h-full { height: 100%; }
        .border-b { border-bottom-width: 1px; }
        .border-white\\/5 { border-color: rgba(255, 255, 255, 0.05); }
        .backdrop-blur-md { backdrop-filter: blur(12px); }
        .bg-black\\/20 { background-color: rgba(0, 0, 0, 0.2); }
        .text-xl { font-size: 1.25rem; }
        .font-black { font-weight: 900; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .tracking-wider { letter-spacing: 0.05em; }
        .text-black { color: black; }
        .fill-black { fill: black; }
        .w-10 { width: 2.5rem; }
        .h-10 { height: 2.5rem; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
        </header>
    )
}
