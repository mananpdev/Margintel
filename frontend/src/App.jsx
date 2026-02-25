import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import Header from './components/Header'
import UploadPanel from './components/UploadPanel'
import ResultsPanel from './components/ResultsPanel'
import Footer from './components/Footer'

const API = ''

export default function App() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ pct: 0, label: '' })
  const [history, setHistory] = useState([])
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 5000)
  }, [])

  const runAnalysis = useCallback(async (formData) => {
    setLoading(true)
    setReport(null)

    // Professional sequence labels
    const auditSteps = [
      'Synchronizing data streams',
      'Executing contribution models',
      'Correlating return signatures',
      'Synthesizing LLM intelligence',
      'Finalizing strategic report'
    ]

    let stepIdx = 0
    const interval = setInterval(() => {
      setProgress(prev => {
        const nextPct = Math.min(prev.pct + (Math.random() * 4), 99)
        if (nextPct > (stepIdx + 1) * 20 && stepIdx < auditSteps.length - 1) {
          stepIdx++
        }
        return { pct: nextPct, label: auditSteps[stepIdx] }
      })
    }, 500)

    try {
      const resp = await fetch(`${API}/v1/runs`, { method: 'POST', body: formData })
      if (!resp.ok) throw new Error('Data processing interface returned an error')

      const data = await resp.json()
      const reportResp = await fetch(`${API}/v1/runs/${data.run_id}`)
      const reportData = await reportResp.json()
      const fullReport = reportData.report || reportData

      clearInterval(interval)
      setProgress({ pct: 100, label: 'Optimization complete' })

      setReport(fullReport)
      setHistory(prev => [{ id: data.run_id, time: new Date(), report: fullReport }, ...prev])
      showToast('Neural intelligence synthesis complete')
    } catch (err) {
      clearInterval(interval)
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
      setTimeout(() => setProgress({ pct: 0, label: '' }), 1000)
    }
  }, [showToast])

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div className="million-dollar-bg" />
      <div className="grid-overlay" />

      <Header />

      <main className="container flex-grow py-24 relative z-10">
        {/* Luxury Hero */}
        <section style={{ marginBottom: '6rem', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--muted)',
              marginBottom: '2rem'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Enterprise Strategic Intelligence v0.1
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-gradient"
          >
            The future of <br /> margin intelligence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{
              color: 'var(--muted)',
              fontSize: '1.25rem',
              maxWidth: '36rem',
              margin: '2rem auto 0',
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            Synthesize your transactional data with LLM-powered strategic forecasting to identify, secure, and grow your contribution margin.
          </motion.p>
        </section>

        {/* Tactical Interaction Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '4rem', alignItems: 'start' }}>
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <UploadPanel onSubmit={runAnalysis} loading={loading} progress={progress} />

            <AnimatePresence>
              {history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass"
                  style={{ padding: '2rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                      Historical Index
                    </h3>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>{history.length} ITEMS</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {history.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setReport(h.report)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '1rem',
                          borderRadius: '10px',
                          background: report?.run_id === h.id ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)',
                          border: `1px solid ${report?.run_id === h.id ? 'var(--border-strong)' : 'transparent'}`,
                          color: report?.run_id === h.id ? '#fff' : 'var(--muted)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{h.id.slice(0, 16).toUpperCase()}</span>
                        <span style={{ opacity: 0.4, fontSize: '0.65rem', fontWeight: 700 }}>{h.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

          <ResultsPanel report={report} />
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
              position: 'fixed',
              top: '6rem',
              right: '2rem',
              padding: '12px 20px',
              borderRadius: '8px',
              background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              color: toast.type === 'error' ? '#fff' : '#000',
              fontWeight: 700,
              fontSize: '0.75rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              zIndex: 1000,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: `1px solid ${toast.type === 'error' ? 'rgba(255,255,255,0.2)' : 'transparent'}`
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .min-h-screen { min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
        .flex-grow { flex-grow: 1; }
        .py-24 { padding-top: 6rem; padding-bottom: 6rem; }
        @media (max-width: 1100px) {
          main > div { grid-template-columns: 1fr !important; }
          h1 { font-size: 3rem !important; }
        }
      `}</style>
    </div>
  )
}
