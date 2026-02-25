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
            height: '64px',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'rgba(10, 10, 15, 0.85)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
        }}>
            <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    {/* Thin O Ring Logo */}
                    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="5" width="22" height="22" rx="6" stroke="#ffffff" strokeWidth="3" fill="none" />
                    </svg>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>Margintel</span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.03)'
                }}>
                    <div style={{
                        backgroundColor: health?.ok ? 'var(--success)' : 'var(--error)',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        boxShadow: health?.ok ? '0 0 6px rgba(16, 185, 129, 0.4)' : '0 0 6px rgba(239, 68, 68, 0.4)'
                    }} />
                    <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {health?.ok ? (health?.llm_available ? 'Engine Active' : 'Core Ready') : 'Offline'}
                    </span>
                </div>
            </div>
        </header>
    )
}
