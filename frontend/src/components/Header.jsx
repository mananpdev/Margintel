import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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
        <header style={{
            height: '72px',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'rgba(9, 9, 11, 0.8)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
        }}>
            <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '2px', backgroundColor: '#000' }} />
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Margintel</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '999px',
                        border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.03)'
                    }}>
                        <div className={`w-2 h-2 rounded-full ${health?.ok ? 'bg-success' : 'bg-error'}`} style={{
                            backgroundColor: health?.ok ? 'var(--success)' : 'var(--error)',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%'
                        }} />
                        <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {health?.ok ? (health?.llm_available ? 'Engine Optimized' : 'Core Ready') : 'Connection Interrupted'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    )
}
