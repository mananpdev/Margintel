import { useState, useCallback } from 'react'
import './index.css'
import Header from './components/Header'
import Hero from './components/Hero'
import UploadPanel from './components/UploadPanel'
import ResultsPanel from './components/ResultsPanel'
import Footer from './components/Footer'

const API = ''

export default function App() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ pct: 0, label: '' })
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const runAnalysis = useCallback(async (formData) => {
    setLoading(true)
    setError(null)
    setReport(null)

    const steps = [
      'Uploading CSVs…', 'Profiling order data…', 'Analyzing returns…',
      'Revenue dependency scan…', 'LLM reasoning pass…', 'Assembling report…'
    ]
    let pct = 0, si = 0
    const interval = setInterval(() => {
      pct = Math.min(pct + Math.random() * 10 + 4, 93)
      if (pct > (si + 1) * 15 && si < steps.length) si++
      setProgress({ pct, label: steps[Math.min(si, steps.length - 1)] })
    }, 350)

    try {
      const resp = await fetch(`${API}/v1/runs`, { method: 'POST', body: formData })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error || `HTTP ${resp.status}`)
      }
      const data = await resp.json()
      clearInterval(interval)
      setProgress({ pct: 100, label: 'Complete ✓' })

      const reportResp = await fetch(`${API}/v1/runs/${data.run_id}`)
      const reportData = await reportResp.json()
      const fullReport = reportData.report || reportData

      setReport(fullReport)
      setHistory(prev => [{ id: data.run_id, time: new Date(), report: fullReport }, ...prev])
      showToast('Analysis complete!')
    } catch (err) {
      clearInterval(interval)
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
      setTimeout(() => setProgress({ pct: 0, label: '' }), 2000)
    }
  }, [showToast])

  const loadHistoryRun = useCallback((run) => {
    setReport(run.report)
  }, [])

  const downloadReport = useCallback(async (runId) => {
    try {
      const resp = await fetch(`${API}/v1/runs/${runId}/download`)
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `report_${runId}.json`; a.click()
      URL.revokeObjectURL(url)
      showToast('Downloaded!')
    } catch { showToast('Download failed', 'error') }
  }, [showToast])

  return (
    <>
      <div className="ambient">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <Header />
      <Hero />
      <main className="container" style={{ flex: 1, paddingBottom: 80 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '420px 1fr',
          gap: 28,
          alignItems: 'start',
        }}>
          <div>
            <UploadPanel
              onSubmit={runAnalysis}
              loading={loading}
              progress={progress}
            />
            {history.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>
                  Run History
                </div>
                {history.map((r, i) => (
                  <div
                    key={r.id}
                    onClick={() => loadHistoryRun(r)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${report?.run_id === r.id ? 'rgba(99,132,255,.3)' : 'transparent'}`,
                      background: report?.run_id === r.id ? 'rgba(99,132,255,.06)' : 'transparent',
                      transition: 'all .2s', marginBottom: 3,
                    }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{r.id.slice(0, 8)}…</span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>{r.time.toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ResultsPanel report={report} onDownload={downloadReport} />
        </div>
      </main>
      <Footer />
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, padding: '12px 22px',
          borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 1000,
          background: toast.type === 'error' ? 'rgba(251,113,133,.9)' : 'rgba(74,222,128,.9)',
          color: toast.type === 'error' ? '#1c0606' : '#042f2e',
          boxShadow: '0 8px 32px rgba(0,0,0,.4)',
          animation: 'fadeUp .3s ease',
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @media(max-width:1000px) {
          main .container > div { grid-template-columns: 1fr !important; }
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  )
}
