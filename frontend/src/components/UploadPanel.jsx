import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UploadPanel({ onSubmit, loading, progress }) {
    const [orders, setOrders] = useState(null)
    const [returns, setReturns] = useState(null)
    const inputRef = useRef()
    const returnRef = useRef()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!orders) return
        const fd = new FormData()
        fd.append('orders_file', orders)
        if (returns) fd.append('returns_file', returns)
        onSubmit(fd)
    }

    return (
        <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Configure Dataset</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Orders Upload */}
                    <div
                        onClick={() => inputRef.current.click()}
                        style={{
                            height: '120px',
                            borderRadius: 'var(--radius-lg)',
                            border: `1px dashed ${orders ? 'var(--accent)' : 'var(--border)'}`,
                            background: orders ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            gap: '0.5rem'
                        }}
                    >
                        <input
                            ref={inputRef} type="file" style={{ display: 'none' }}
                            onChange={(e) => setOrders(e.target.files[0])}
                        />
                        {orders ? (
                            <span style={{ fontSize: '0.8125rem', color: '#fff', fontWeight: 500 }}>{orders.name}</span>
                        ) : (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Drop <b style={{ color: '#fff' }}>Orders CSV</b> here</span>
                        )}
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Required</span>
                    </div>

                    {/* Returns Upload */}
                    <div
                        onClick={() => returnRef.current.click()}
                        style={{
                            padding: '1rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${returns ? 'var(--accent)' : 'var(--border)'}`,
                            background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <input
                            ref={returnRef} type="file" style={{ display: 'none' }}
                            onChange={(e) => setReturns(e.target.files[0])}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.8125rem', color: returns ? '#fff' : 'var(--text-secondary)', fontWeight: 500 }}>
                                {returns ? returns.name : 'Supplement Returns Data'}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Optional</span>
                        </div>
                    </div>
                </div>

                <button
                    disabled={!orders || loading}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        opacity: (!orders || loading) ? 0.3 : 1,
                        cursor: (!orders || loading) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Processing...' : 'Analyze Datasets'}
                </button>
            </form>

            {progress.pct > 0 && (
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{progress.label}</span>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{Math.round(progress.pct)}%</span>
                    </div>
                    <div style={{ h: '2px', width: '100%', background: 'var(--border)', borderRadius: '999px', h: '2px', overflow: 'hidden' }}>
                        <div
                            style={{ h: '100%', bg: '#fff', width: `${progress.pct}%`, transition: 'width 0.3s ease', height: '2px', background: '#fff' }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
