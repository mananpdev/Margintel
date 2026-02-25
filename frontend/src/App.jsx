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
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-black" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Interactive Background Layer ── */}
      <div className="million-dollar-bg" />
      <div className="grid-overlay" />

      {/* Dynamic Cursor Spotlight */}
      <motion.div
        style={{
          position: 'fixed',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(99, 102, 241, 0.06) 40%, transparent 70%)',
          borderRadius: '50%',
          left: springX,
          top: springY,
          transform: 'translate(-50%, -50%)',
          zIndex: -1,
          pointerEvents: 'none',
          filter: 'blur(60px)'
        }}
      />

      <Header />

      <main className="container" style={{ flex: 1, paddingTop: '4rem', paddingBottom: '4rem', position: 'relative', zIndex: 10 }}>
        {!report && !loading && (
          <section style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                marginBottom: '2rem',
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              <div style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%' }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.1em' }}>
                INTELLIGENCE ENGINE v0.1
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gradient"
              style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '1.5rem' }}
            >
              Margin Intelligence<br />Engine
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: '500px', margin: '0 auto' }}
            >
              Upload transaction data. Receive AI-powered strategic intelligence in seconds.
            </motion.p>
          </section>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '2.5rem', alignItems: 'start' }}>
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '80px' }}>
            <UploadPanel onSubmit={runAnalysis} loading={loading} progress={progress} report={report} onReset={() => setReport(null)} />

            <AnimatePresence>
              {history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass"
                  style={{ padding: '1.5rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                      Historical Index
                    </h3>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>{history.length} ITEMS</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
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

          <div style={{ maxHeight: '80vh', overflowY: 'auto' }} className="scrollbar-hide">
            <ResultsPanel report={report} loading={loading} />
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
