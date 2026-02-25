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
                            height: '140px',
                            borderRadius: '12px',
                            border: `1px dashed ${orders ? 'rgba(6, 182, 212, 0.4)' : 'var(--border)'}`,
                            background: orders ? 'rgba(6, 182, 212, 0.02)' : 'rgba(255,255,255,0.01)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            gap: '0.75rem'
                        }}
                    >
                        <input
                            ref={inputRef} type="file" style={{ display: 'none' }}
                            onChange={(e) => setOrders(e.target.files[0])}
                        />
                        {orders ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{orders.name}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '4px' }}>Target Dataset Identified</p>
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
                            ref={returnRef} type="file" style={{ display: 'none' }}
                            onChange={(e) => setReturns(e.target.files[0])}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: returns ? '#fff' : 'var(--muted)', fontWeight: 600 }}>
                                {returns ? returns.name : 'Supplement Returns Data'}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
                                {returns ? 'Secondary Channel Mapped' : 'Optional Intelligence Layer'}
                            </span>
                        </div>
                    </div>
                </div>

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
