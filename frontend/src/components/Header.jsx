import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Logo from './Logo'

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
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(1, 1, 3, 0.7)',
            display: 'flex',
            alignItems: 'center'
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Logo />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        border: '1px solid var(--border)',
                        background: 'rgba(255,255,255,0.03)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <motion.div
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.6, 1, 0.6]
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                backgroundColor: health?.ok ? 'var(--success)' : 'var(--error)',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                boxShadow: health?.ok ? '0 0 12px var(--success)' : '0 0 12px var(--error)'
                            }}
                        />
                        <span className="mono" style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: health?.ok ? '#fff' : 'var(--fg-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em'
                        }}>
                            {health?.ok ? 'Neural Engine Active' : 'Engine Offline'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    )
}
