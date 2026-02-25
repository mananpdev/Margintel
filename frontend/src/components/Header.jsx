import { useState, useEffect } from 'react'

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* White Logo Mark */}
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <rect width="28" height="28" rx="6" fill="#ffffff" />
                        <path d="M8 14L11 9L14 14L17 9L20 14" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="8" y1="19" x2="20" y2="19" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <h1 style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>Margintel</h1>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.03)'
                }}>
                    <div style={{
                        backgroundColor: health?.ok ? 'var(--success)' : 'var(--error)',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        boxShadow: health?.ok ? '0 0 8px rgba(16, 185, 129, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)'
                    }} />
                    <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {health?.ok ? (health?.llm_available ? 'Engine Optimized' : 'Core Ready') : 'Offline'}
                    </span>
                </div>
            </div>
        </header>
    )
}
