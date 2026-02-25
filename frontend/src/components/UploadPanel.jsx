import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileSpreadsheet, Loader2, Zap, AlertCircle } from 'lucide-react'

function DropZone({ id, label, required, icon, accept, onFile, file }) {
    const [drag, setDrag] = useState(false)
    const [preview, setPreview] = useState(null)
    const inputRef = useRef()

    const handleFile = useCallback((f) => {
        onFile(f)
        const reader = new FileReader()
        reader.onload = e => {
            const lines = e.target.result.split('\n').slice(0, 3)
            setPreview(lines.join('\n'))
        }
        reader.readAsText(f.slice(0, 2000))
    }, [onFile])

    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 7, letterSpacing: .5, textTransform: 'uppercase' }}>
                {label} {required ? <span style={{ color: 'var(--red)' }}>*</span> : <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 10, textTransform: 'none' }}>(optional)</span>}
            </label>
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
                onClick={() => inputRef.current?.click()}
                style={{
                    border: `2px dashed ${file ? 'var(--green)' : drag ? 'var(--accent)' : 'var(--glass-border)'}`,
                    borderStyle: file ? 'solid' : 'dashed',
                    borderRadius: 10, padding: file ? '16px' : '22px 14px',
                    textAlign: 'center', cursor: 'pointer',
                    background: file ? 'var(--green-dim)' : drag ? 'rgba(99,132,255,.03)' : 'var(--bg-1)',
                    transition: 'all .25s',
                    position: 'relative',
                }}
            >
                <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
                {!file ? (
                    <>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)' }}><b style={{ color: 'var(--accent)' }}>Click</b> or drag file here</div>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                            ✓ {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                        <AnimatePresence>
                            {preview && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    style={{
                                        marginTop: 8, textAlign: 'left', fontFamily: 'var(--mono)',
                                        fontSize: 10, color: 'var(--text-3)', lineHeight: 1.6,
                                        background: 'rgba(0,0,0,.25)', borderRadius: 6, padding: '8px 10px',
                                        maxHeight: 70, overflow: 'hidden',
                                    }}
                                >
                                    {preview}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </motion.div>
        </div>
    )
}

export default function UploadPanel({ onSubmit, loading, progress }) {
    const [ordersFile, setOrdersFile] = useState(null)
    const [returnsFile, setReturnsFile] = useState(null)
    const [goal, setGoal] = useState('Identify margin risks and prioritize fixes')
    const [constraints, setConstraints] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!ordersFile) return
        const fd = new FormData()
        fd.append('orders_file', ordersFile)
        if (returnsFile) fd.append('returns_file', returnsFile)
        fd.append('business_goal', goal)
        fd.append('constraints', constraints)
        onSubmit(fd)
    }

    return (
        <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
            className="glass"
            style={{ padding: 26 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,132,255,.12)', display: 'grid', placeItems: 'center' }}>
                    <Upload size={16} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Upload Data</h3>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 12, marginBottom: 20 }}>
                Provide orders CSV and optionally returns CSV for deeper analysis.
            </p>

            <form onSubmit={handleSubmit}>
                <DropZone id="orders" label="Orders CSV" required icon="📊" accept=".csv" file={ordersFile} onFile={setOrdersFile} />
                <DropZone id="returns" label="Returns CSV" icon="🔄" accept=".csv" file={returnsFile} onFile={setReturnsFile} />

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 7, letterSpacing: .5, textTransform: 'uppercase' }}>
                        Business Goal <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 10, textTransform: 'none' }}>(optional)</span>
                    </label>
                    <input
                        type="text" value={goal} onChange={e => setGoal(e.target.value)}
                        placeholder="Identify margin risks and prioritize fixes"
                        style={{
                            width: '100%', padding: '11px 14px', borderRadius: 6,
                            border: '1px solid var(--glass-border)', background: 'var(--bg-1)',
                            color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13,
                            outline: 'none', transition: 'all .2s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 7, letterSpacing: .5, textTransform: 'uppercase' }}>
                        Constraints <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 10, textTransform: 'none' }}>(optional)</span>
                    </label>
                    <input
                        type="text" value={constraints} onChange={e => setConstraints(e.target.value)}
                        placeholder="e.g., 2-week sprint, no new tools"
                        style={{
                            width: '100%', padding: '11px 14px', borderRadius: 6,
                            border: '1px solid var(--glass-border)', background: 'var(--bg-1)',
                            color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13,
                            outline: 'none', transition: 'all .2s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                    />
                </div>

                <motion.button
                    whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(99,132,255,.35)' }}
                    whileTap={{ y: 0 }}
                    disabled={loading || !ordersFile}
                    type="submit"
                    style={{
                        width: '100%', padding: '14px 24px', border: 'none', borderRadius: 10,
                        background: 'var(--grad)', color: '#fff', fontFamily: 'var(--font)',
                        fontSize: 15, fontWeight: 700, cursor: loading || !ordersFile ? 'not-allowed' : 'pointer',
                        opacity: loading || !ordersFile ? .5 : 1, letterSpacing: .3,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                >
                    {loading ? <Loader2 size={16} style={{ animation: 'spin .7s linear infinite' }} /> : <Zap size={16} />}
                    {loading ? 'Analyzing…' : 'Run Analysis'}
                </motion.button>
            </form>

            <AnimatePresence>
                {progress.pct > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ marginTop: 16, overflow: 'hidden' }}
                    >
                        <div style={{ height: 4, background: 'var(--glass-border)', borderRadius: 4, overflow: 'hidden' }}>
                            <motion.div
                                animate={{ width: `${progress.pct}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{ height: '100%', background: 'var(--grad)', borderRadius: 4 }}
                            />
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, textAlign: 'center' }}>
                            {progress.label}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`@keyframes spin { 100% { transform: rotate(360deg) } }`}</style>
        </motion.div>
    )
}
