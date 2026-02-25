import { motion } from 'framer-motion'

export default function Hero() {
    return (
        <section className="container" style={{ textAlign: 'center', padding: '64px 0 40px' }}>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '7px 18px', borderRadius: 999,
                    fontSize: 11, fontWeight: 700, letterSpacing: .6,
                    textTransform: 'uppercase',
                    background: 'linear-gradient(135deg, rgba(99,132,255,.08) 0%, rgba(163,112,247,.06) 100%)',
                    border: '1px solid rgba(99,132,255,.18)', color: 'var(--accent)',
                    marginBottom: 20,
                }}
            >
                ✦ Deterministic + LLM Hybrid Analysis
            </motion.div>
            <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="gradient-text"
                style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, letterSpacing: -2, lineHeight: 1.08, marginBottom: 14 }}
            >
                Margin Intelligence<br />Engine
            </motion.h2>
            <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}
            >
                Upload order & return CSVs — get actionable insights with revenue risk signals,
                return themes, and ranked business decisions.
            </motion.p>
        </section>
    )
}
