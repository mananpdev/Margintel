import { motion } from 'framer-motion'

export default function Logo({ size = 28, showText = true, fontSize = '1.2rem' }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
                {/* ── Outer Geometric Frame (Obsidian) ── */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#010103',
                    border: '1.5px solid var(--accent)',
                    borderRadius: '22%',
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.15)'
                }} />

                {/* ── Inner Signal Frame (Pure White) ── */}
                <div style={{
                    position: 'absolute',
                    inset: '22%',
                    border: '2px solid #fff',
                    borderRadius: '15%'
                }} />

                {/* ── Neural Origin Point (Accent) ── */}
                <motion.div
                    animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [0.9, 1.1, 0.9],
                        boxShadow: [
                            '0 0 5px var(--accent)',
                            '0 0 15px var(--accent)',
                            '0 0 5px var(--accent)'
                        ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute',
                        top: '12%',
                        right: '12%',
                        width: '22%',
                        height: '22%',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        zIndex: 2
                    }}
                />
            </div>

            {showText && (
                <span className="font-display" style={{
                    fontSize: fontSize,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    Margintel<span style={{ color: 'var(--accent)' }}>.ai</span>
                </span>
            )}
        </div>
    )
}
