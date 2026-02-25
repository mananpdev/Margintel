import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Wifi, WifiOff } from 'lucide-react'

export default function Header() {
    const [health, setHealth] = useState(null)

    useEffect(() => {
        const check = async () => {
            try {
                const r = await fetch('/health')
                const d = await r.json()
                setHealth(d)
            } catch { setHealth(null) }
        }
        check()
        const i = setInterval(check, 30000)
        return () => clearInterval(i)
    }, [])

    const online = health?.ok
    const llm = health?.llm_available

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
                padding: '14px 0',
                borderBottom: '1px solid var(--glass-border)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(4,6,12,.85)',
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: 'var(--grad)', display: 'grid', placeItems: 'center',
                        fontSize: 18, boxShadow: '0 0 30px rgba(99,132,255,.3)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <Zap size={20} color="white" strokeWidth={2.5} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,255,255,.15) 0%,transparent 60%)' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 19, fontWeight: 800, letterSpacing: -.6 }}>Margintel</h1>
                        <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 1.8, textTransform: 'uppercase' }}>Intelligence Engine</span>
                    </div>
                </div>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 16px', borderRadius: 999,
                        fontSize: 12, fontWeight: 600,
                        border: `1px solid ${online ? 'rgba(74,222,128,.35)' : 'rgba(251,113,133,.35)'}`,
                        color: online ? 'var(--green)' : 'var(--red)',
                        background: 'var(--glass)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    {online ? <Wifi size={14} /> : <WifiOff size={14} />}
                    {online ? (llm ? 'Online · LLM Active' : 'Online · No LLM') : 'Offline'}
                </motion.div>
            </div>
        </motion.header>
    )
}
