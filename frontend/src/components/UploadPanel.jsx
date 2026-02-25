import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UploadPanel({ onSubmit, loading, progress, report, onReset }) {
    const [orders, setOrders] = useState(null)
    const [returns, setReturns] = useState(null)
    const [businessGoal, setBusinessGoal] = useState('')
    const [constraints, setConstraints] = useState('')
    const [showAdvanced, setShowAdvanced] = useState(false)
    const inputRef = useRef()
    const returnRef = useRef()
    const formRef = useRef()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!orders) return
        const fd = new FormData()
        fd.append('orders_file', orders)
        if (returns) fd.append('returns_file', returns)
        if (businessGoal.trim()) fd.append('business_goal', businessGoal.trim())
        if (constraints.trim()) fd.append('constraints', constraints.trim())
        onSubmit(fd)
    }

    const handleReset = () => {
        setOrders(null)
        setReturns(null)
        setBusinessGoal('')
        setConstraints('')
        if (onReset) onReset()
    }

    const handleDownload = async () => {
        if (!report?.run_id) return
        try {
            const resp = await fetch(`/v1/runs/${report.run_id}/download`)
            const blob = await resp.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `report_${report.run_id}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch {
            // Fallback
            window.open(`/v1/runs/${report.run_id}/download`, '_blank')
        }
    }

    // Keyboard shortcut: Ctrl+Enter to submit
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && orders && !loading) {
            e.preventDefault()
            formRef.current?.requestSubmit()
        }
    }

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1048576).toFixed(1)} MB`
    }

    return (
        <div className="glass" style={{ padding: '1.5rem' }} onKeyDown={handleKeyDown}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Configure Dataset</h2>

            <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Orders Upload */}
                    <div
                        onClick={() => inputRef.current.click()}
                        style={{
                            height: orders ? 'auto' : '140px',
                            minHeight: orders ? '80px' : '140px',
                            borderRadius: '12px',
                            border: `1px dashed ${orders ? 'rgba(6, 182, 212, 0.4)' : 'var(--border)'}`,
                            background: orders ? 'rgba(6, 182, 212, 0.02)' : 'rgba(255,255,255,0.01)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            gap: '0.5rem',
                            padding: orders ? '1rem' : '0'
                        }}
                    >
                        <input
                            ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }}
                            onChange={(e) => setOrders(e.target.files[0])}
                        />
                        {orders ? (
                            <div style={{ textAlign: 'center', width: '100%' }}>
                                <p style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{orders.name}</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '6px' }}>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 700 }}>
                                        {formatSize(orders.size)}
                                    </span>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--muted)', fontWeight: 600 }}>
                                        CSV • Primary Dataset
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 }}>Drop <span style={{ color: '#fff' }}>Orders CSV</span></p>
                                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>Primary Input Required</p>
                            </div>
                        )}
                    </div>

                    {/* Returns Upload */}
                    <div
                        onClick={() => returnRef.current.click()}
                        style={{
                            padding: '1.25rem',
                            borderRadius: '12px',
                            border: `1px solid ${returns ? 'rgba(6, 182, 212, 0.2)' : 'var(--border)'}`,
                            background: returns ? 'rgba(6, 182, 212, 0.02)' : 'rgba(255,255,255,0.01)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <input
                            ref={returnRef} type="file" accept=".csv" style={{ display: 'none' }}
                            onChange={(e) => setReturns(e.target.files[0])}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: returns ? '#fff' : 'var(--muted)', fontWeight: 600 }}>
                                {returns ? returns.name : 'Supplement Returns Data'}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: returns ? 'var(--accent)' : 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
                                {returns ? `${formatSize(returns.size)} • Secondary Channel` : 'Optional Intelligence Layer'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Advanced Settings Toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: '4px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}
                >
                    <span style={{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block', fontSize: '0.6rem' }}>▶</span>
                    Analysis Parameters
                </button>

                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                        >
                            <div>
                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                                    Business Goal
                                </label>
                                <input
                                    type="text"
                                    value={businessGoal}
                                    onChange={(e) => setBusinessGoal(e.target.value)}
                                    placeholder="e.g. Reduce return rate by 15%"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        outline: 'none',
                                        fontFamily: 'var(--font-sans)',
                                        transition: 'border-color 0.2s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                                    Constraints
                                </label>
                                <input
                                    type="text"
                                    value={constraints}
                                    onChange={(e) => setConstraints(e.target.value)}
                                    placeholder="e.g. Budget max $10K, no SKU removal"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        outline: 'none',
                                        fontFamily: 'var(--font-sans)',
                                        transition: 'border-color 0.2s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    disabled={!orders || loading}
                    className="btn-premium"
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: (!orders || loading) ? 'rgba(255,255,255,0.05)' : '#fff',
                        color: (!orders || loading) ? 'var(--muted)' : '#000',
                        border: '1px solid var(--border)',
                        opacity: 1,
                        cursor: (!orders || loading) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Synthesizing...' : 'Execute Analysis'}
                    {!loading && orders && (
                        <span style={{ fontSize: '0.6rem', color: 'rgba(0,0,0,0.4)', marginLeft: '8px' }}>⌘↵</span>
                    )}
                </button>
            </form>

            {/* Action Buttons */}
            {report && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                        onClick={handleDownload}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--muted)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        ↓ Export JSON
                    </button>
                    <button
                        onClick={handleReset}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--muted)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        + New Analysis
                    </button>
                </div>
            )}

            {progress.pct > 0 && (
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>{progress.label}</span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{Math.round(progress.pct)}%</span>
                    </div>
                    <div style={{ height: '2px', width: '100%', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                            style={{ height: '100%', background: '#fff', width: `${progress.pct}%`, transition: 'width 0.5s ease' }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
