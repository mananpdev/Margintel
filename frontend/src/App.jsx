import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
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
  const pollingRef = useRef(null)

  // Interactive Background Logic
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { damping: 40, stiffness: 150 })
  const springY = useSpring(mouseY, { damping: 40, stiffness: 150 })

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [mouseX, mouseY])

  // ── Load history from backend on mount ──
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const resp = await fetch(`${API}/v1/runs`)
        if (!resp.ok) return
        const data = await resp.json()
        const runs = data.runs || []
        // For each completed run, fetch the full report
        const fullRuns = await Promise.all(
          runs.map(async (r) => {
            try {
              const rr = await fetch(`${API}/v1/runs/${r.id}`)
              const rd = await rr.json()
              return { id: r.id, time: new Date(r.generated_at), report: rd.report || rd }
            } catch { return null }
          })
        )
        setHistory(fullRuns.filter(Boolean))
      } catch { /* ignore on mount */ }
    }
    loadHistory()
  }, [])

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 8000)
  }, [])

  // ── Poll backend for real progress ──
  const pollProgress = useCallback((runId) => {
    if (pollingRef.current) clearInterval(pollingRef.current)

    pollingRef.current = setInterval(async () => {
      try {
        const resp = await fetch(`${API}/v1/runs/${runId}`)
        const data = await resp.json()

        // Update progress from backend
        if (data.progress) {
          setProgress({ pct: data.progress.pct, label: data.progress.label })
        }

        // Check if done
        if (data.status === 'done') {
          clearInterval(pollingRef.current)
          pollingRef.current = null
          const fullReport = data.report || data
          setReport(fullReport)
          setHistory(prev => [{ id: runId, time: new Date(), report: fullReport }, ...prev])
          setLoading(false)
          showToast('Neural intelligence synthesis complete')
          setTimeout(() => setProgress({ pct: 0, label: '' }), 1500)
        }

        // Check if error
        if (data.status === 'error') {
          clearInterval(pollingRef.current)
          pollingRef.current = null
          setLoading(false)
          showToast(data.error || 'Pipeline failed', 'error')
          setTimeout(() => setProgress({ pct: 0, label: '' }), 1500)
        }
      } catch {
        // Network error — keep polling
      }
    }, 1000) // Poll every second
  }, [showToast])

  const runAnalysis = useCallback(async (formData) => {
    setLoading(true)
    setReport(null)
    setProgress({ pct: 2, label: 'Initializing data streams' })

    try {
      const resp = await fetch(`${API}/v1/runs`, { method: 'POST', body: formData })
      const data = await resp.json()

      if (!resp.ok) {
        // Show the actual backend error message (#8)
        throw new Error(data.error || 'Analysis request failed')
      }

      // Start polling for real progress
      pollProgress(data.run_id)
    } catch (err) {
      setLoading(false)
      showToast(err.message, 'error')
      setTimeout(() => setProgress({ pct: 0, label: '' }), 1000)
    }
  }, [showToast, pollProgress])

  // ── Keyboard shortcuts (#15) ──
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && report) {
        setReport(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [report])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden text-slate-50" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Background Infrastructure ── */}
      <div className="million-dollar-bg" />
      <div className="ambient-light" />
      <div className="grid-overlay" />

      {/* Dynamic Cursor Spotlight - Senior dev touch: Subtle blur and larger reach */}
      <motion.div
        style={{
          position: 'fixed',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(99, 102, 241, 0.03) 40%, transparent 70%)',
          borderRadius: '50%',
          left: springX,
          top: springY,
          transform: 'translate(-50%, -50%)',
          zIndex: -1,
          pointerEvents: 'none',
          filter: 'blur(100px)'
        }}
      />

      <Header />

      <main className="container" style={{ flex: 1, paddingTop: '6rem', paddingBottom: '6rem', position: 'relative', zIndex: 10 }}>
        {!report && !loading && (
          <header style={{ marginBottom: '5rem', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                marginBottom: '2.5rem',
                background: 'rgba(255,255,255,0.02)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
              }}
            >
              <span style={{ display: 'block', width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }} />
              <span className="mono" style={{ color: 'var(--fg-soft)', letterSpacing: '0.15em', fontWeight: 600 }}>
                STRATEGIC INTELLIGENCE ENGINE v1.0
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-gradient"
              style={{ fontSize: '4.5rem', lineHeight: 1.05, marginBottom: '1.5rem', fontWeight: 800 }}
            >
              Predict. Optimize.<br />Dominate Margins.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              style={{ fontSize: '1.25rem', color: 'var(--fg-soft)', maxWidth: '600px', margin: '0 auto', fontWeight: 400 }}
            >
              Neural-powered synthesis of transaction streams into high-impact strategic actions.
            </motion.p>
          </header>
        )}

        {/* Main Interface Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '3rem', alignItems: 'start' }}>

          {/* Left Control Column */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '100px' }}>
            <UploadPanel onSubmit={runAnalysis} loading={loading} progress={progress} report={report} onReset={() => setReport(null)} />

            <AnimatePresence>
              {history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass"
                  style={{ padding: '1.5rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--fg-muted)', letterSpacing: '0.1em' }}>
                      SYNTHESIS REGISTRY
                    </h3>
                    <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700 }}>{history.length} RECORDS</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }} className="scrollbar-hide">
                    {history.map((h, idx) => (
                      <motion.button
                        key={h.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setReport(h.report)}
                        className="history-item"
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: report?.run_id === h.id ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid',
                          borderColor: report?.run_id === h.id ? 'var(--accent)' : 'transparent',
                          color: report?.run_id === h.id ? '#fff' : 'var(--fg-soft)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span className="mono" style={{ fontWeight: 700, color: report?.run_id === h.id ? 'var(--accent)' : 'inherit' }}>
                            {h.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{h.time.toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', display: 'flex', gap: '8px' }}>
                          <span style={{ color: 'var(--fg-muted)' }}>REV:</span>
                          <span style={{ fontWeight: 600 }}>${(h.report?.profiling?.total_revenue / 1000).toFixed(1)}k</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

          {/* Right Intelligence Column */}
          <div style={{ minHeight: '600px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={report?.run_id || 'empty'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              >
                <ResultsPanel report={report} loading={loading} />
              </motion.div>
            </AnimatePresence>
          </div>
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
              background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              color: toast.type === 'error' ? '#fca5a5' : '#6ee7b7',
              fontSize: '0.75rem',
              fontWeight: 600,
              zIndex: 1000,
              maxWidth: '400px',
              backdropFilter: 'blur(10px)'
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
