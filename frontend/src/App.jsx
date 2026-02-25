import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import Background from './components/Background'
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
    setTimeout(() => setToast(null), 4000)
  }, [])

  const runAnalysis = useCallback(async (formData) => {
    setLoading(true)
    setReport(null)

    const steps = ['Initializing Core...', 'Inhaling Sequences...', 'Mapping Risks...', 'Simulating Fixes...', 'Finalizing Intel...']
    let currentStep = 0
    const interval = setInterval(() => {
      setProgress(prev => {
        const nextPct = Math.min(prev.pct + (Math.random() * 8), 96)
        if (nextPct > (currentStep + 1) * 20 && currentStep < steps.length - 1) {
          currentStep++
        }
        return { pct: nextPct, label: steps[currentStep] }
      })
    }, 300)

    try {
      const resp = await fetch(`${API}/v1/runs`, { method: 'POST', body: formData })
      if (!resp.ok) throw new Error('Sequence break detected')

      const data = await resp.json()
      const reportResp = await fetch(`${API}/v1/runs/${data.run_id}`)
      const reportData = await reportResp.json()
      const fullReport = reportData.report || reportData

      clearInterval(interval)
      setProgress({ pct: 100, label: 'Sync Complete' })

      setReport(fullReport)
      setHistory(prev => [{ id: data.run_id, time: new Date(), report: fullReport }, ...prev])
      showToast('Neural sync complete')
    } catch (err) {
      clearInterval(interval)
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
      setTimeout(() => setProgress({ pct: 0, label: '' }), 1000)
    }
  }, [showToast])

  return (
    <div className="flex flex-col min-h-screen">
      <Background />
      <Header />

      <main className="container flex-grow py-12">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-black uppercase tracking-widest text-teal-400">
              System v0.1
            </div>
            <div className="h-px flex-grow bg-white/5" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black tracking-tighter mb-4"
          >
            Margin Command Center
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 max-w-2xl text-lg leading-relaxed"
          >
            Inject your logistical data streams to identify margin leakages and generate autonomous business optimization strategies.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <UploadPanel onSubmit={runAnalysis} loading={loading} progress={progress} />

            <AnimatePresence>
              {history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-8"
                >
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Archive Index</h3>
                  <div className="space-y-3">
                    {history.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setReport(h.report)}
                        className={`w-full text-left p-4 rounded-2xl transition-all relative overflow-hidden group ${report?.run_id === h.id
                            ? 'bg-teal-500/10 text-teal-400'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                      >
                        {report?.run_id === h.id && <motion.div layoutId="active-run" className="absolute left-0 top-0 w-1 h-full bg-teal-500" />}
                        <div className="flex justify-between items-center relative z-10">
                          <span className="font-mono text-[11px] font-bold">{h.id.slice(0, 16)}</span>
                          <span className="text-[10px] opacity-40">{h.time.toLocaleTimeString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-8">
            <ResultsPanel report={report} />
          </div>
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-12 right-12 px-8 py-4 rounded-2xl shadow-2xl z-[1000] flex items-center gap-4 backdrop-blur-xl border ${toast.type === 'error' ? 'bg-rose-500/20 border-rose-500/40 text-rose-200' : 'bg-teal-500/20 border-teal-500/40 text-teal-200'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-teal-500'} animate-pulse`} />
            <span className="font-bold text-sm tracking-tight">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
        .lg\\:col-span-4 { grid-column: span 4 / span 4; }
        .lg\\:col-span-8 { grid-column: span 8 / span 8; }
        .gap-8 { gap: 2rem; }
        .gap-6 { gap: 1.5rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
        .p-8 { padding: 2rem; }
        .p-4 { padding: 1rem; }
        .mb-12 { margin-bottom: 3rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .bottom-12 { bottom: 3rem; }
        .right-12 { right: 3rem; }
        .w-full { width: 100%; }
        .text-left { text-align: left; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-lg { font-size: 1.125rem; }
        .text-teal-400 { color: #2DD4BF; }
        .bg-teal-500\\/10 { background-color: rgba(45, 212, 191, 0.1); }
        .border-teal-500\\/20 { border-color: rgba(45, 212, 191, 0.2); }
        .font-black { font-weight: 900; }
        .font-bold { font-weight: 700; }
        .font-mono { font-family: var(--mono); }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-tight { letter-spacing: -0.025em; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .tracking-\\[0\\.2em\\] { letter-spacing: 0.2em; }
        .leading-relaxed { line-height: 1.625; }
        .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .backdrop-blur-xl { backdrop-filter: blur(24px); }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-grow { flex-grow: 1; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .justify-between { justify-content: space-between; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .left-0 { left: 0; }
        .top-0 { top: 0; }
        .inset-0 { inset: 0; }
        .z-10 { z-index: 10; }
        .z-\\[1000\\] { z-index: 1000; }
        .overflow-hidden { overflow: hidden; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-full { border-radius: 9999px; }
        .border { border-width: 1px; }
        .border-rose-500\\/40 { border-color: rgba(244, 63, 94, 0.4); }
        .bg-rose-500\\/20 { background-color: rgba(244, 63, 94, 0.2); }
        .text-rose-200 { color: #FECDD3; }
        .bg-teal-500\\/20 { background-color: rgba(45, 212, 191, 0.2); }
        .bg-rose-500 { background-color: #F43F5E; }
        .bg-teal-500 { background-color: #14B8A6; }
        .border-teal-500\\/40 { border-color: rgba(20, 184, 166, 0.4); }
        .text-teal-200 { color: #99F6E4; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  )
}
