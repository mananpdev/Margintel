import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

export default function UploadPanel({ onSubmit, loading, progress, report, onReset }) {
    const [orders, setOrders] = useState(null)
    const [returns, setReturns] = useState(null)
    const [businessGoal, setBusinessGoal] = useState('Maximize net margin by 15% through return mitigation.')
    const [constraints, setConstraints] = useState('Minimum inventory churn 4x; No price drops >10%.')
    const [showAdvanced, setShowAdvanced] = useState(false)

    const ordersInputRef = useRef()
    const returnsInputRef = useRef()

    const handleDrop = useCallback((e, setter) => {
        e.preventDefault()
        const file = e.dataTransfer?.files?.[0] || e.target.files?.[0]
        if (file && file.name.endsWith('.csv')) setter(file)
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!orders) return
        const fd = new FormData()
        fd.append('orders_file', orders)
        if (returns) fd.append('returns_file', returns)
        fd.append('business_goal', businessGoal)
        fd.append('constraints', constraints)
        onSubmit(fd)
    }

    const handleReset = () => {
        setOrders(null)
        setReturns(null)
        setBusinessGoal('')
        setConstraints('')
        if (onReset) onReset()
    }

    const formatSize = (bytes) => {
        if (!bytes) return '0 KB'
        const k = bytes / 1024
        return k > 1024 ? `${(k / 1024).toFixed(1)} MB` : `${k.toFixed(0)} KB`
    }

    return (
        <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Synthesis Core</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--fg-soft)', lineHeight: 1.5 }}>
                        Initialize intelligence streams by uploading transaction and return layers.
                    </p>
                </div>
                <div style={{ opacity: 0.6, filter: 'grayscale(1)', transform: 'scale(0.8)', transformOrigin: 'top right' }}>
                    <Logo size={24} showText={false} />
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Dropzone Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <DropZone
                        label="Transaction Layer"
                        file={orders}
                        inputRef={ordersInputRef}
                        onDrop={(e) => handleDrop(e, setOrders)}
                        desc="Orders & Pricing (Required)"
                    />
                    <DropZone
                        label="Return Layer"
                        file={returns}
                        inputRef={returnsInputRef}
                        onDrop={(e) => handleDrop(e, setReturns)}
                        desc="Returns & Reason Log (Optional)"
                    />
                </div>

                {/* Intelligence Context */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label className="mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--fg-muted)', letterSpacing: '0.1em' }}>STRATEGIC OBJECTIVE</label>
                        <textarea
                            value={businessGoal}
                            onChange={e => setBusinessGoal(e.target.value)}
                            placeholder="e.g. Optimize net margin by resolving high-frequency return clusters"
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '0.85rem',
                                minHeight: '80px',
                                resize: 'none',
                                fontFamily: 'inherit',
                                outline: 'none',
                                transition: 'border-color 0.2s ease'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="mono"
                        style={{
                            fontSize: '0.65rem',
                            color: 'var(--fg-muted)',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 700
                        }}
                    >
                        {showAdvanced ? '[-] HIDE PARAMETERS' : '[+] ADVANCED PARAMETERS'}
                    </button>

                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
                                    <label className="mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--fg-muted)' }}>SYNTHESIS CONSTRAINTS</label>
                                    <textarea
                                        value={constraints}
                                        onChange={e => setConstraints(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '12px',
                                            color: 'var(--fg-soft)',
                                            fontSize: '0.8rem',
                                            minHeight: '60px',
                                            resize: 'none',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Action Bar */}
                <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {!loading ? (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                disabled={!orders}
                                className="btn-premium"
                                style={{ flex: 1, height: '52px' }}
                            >
                                {report ? 'RE-SYNTHESIZE' : 'RUN SYNTHESIS'}
                            </button>
                            {report && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        background: 'transparent',
                                        color: 'var(--fg-soft)',
                                        cursor: 'pointer',
                                        width: '52px'
                                    }}
                                >
                                    ↺
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span className="mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.1em' }}>
                                    {progress.label?.toUpperCase() || 'SYNTHESIZING'}
                                </span>
                                <span className="mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)' }}>{Math.round(progress.pct)}%</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress.pct}%` }}
                                    transition={{ duration: 0.5 }}
                                    style={{ height: '100%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}

function DropZone({ label, file, onDrop, desc, inputRef }) {
    const [isOver, setIsOver] = useState(false)

    return (
        <div
            onDragOver={e => { e.preventDefault(); setIsOver(true) }}
            onDragLeave={() => setIsOver(false)}
            onDrop={e => { setIsOver(false); onDrop(e) }}
            onClick={() => inputRef.current?.click()}
            style={{
                position: 'relative',
                height: file ? '80px' : '120px',
                borderRadius: '14px',
                border: `1px ${file ? 'solid' : 'dashed'} ${isOver ? 'var(--accent)' : (file ? 'rgba(6,182,212,0.3)' : 'var(--border)')}`,
                background: isOver ? 'rgba(6, 182, 212, 0.05)' : 'rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: '1rem',
                textAlign: 'center'
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={onDrop}
                style={{ display: 'none' }}
            />

            {!file ? (
                <>
                    <div className="mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--fg-muted)', fontWeight: 500 }}>{desc}</div>
                </>
            ) : (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            ✓
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div className="mono" style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {file.name}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--fg-muted)' }}>{Math.round(file.size / 1024)} KB • Data Synced</div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
