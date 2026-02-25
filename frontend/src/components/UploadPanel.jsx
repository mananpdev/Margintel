import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle2, ChevronRight, Settings } from 'lucide-react'

export default function UploadPanel({ onSubmit, loading, progress }) {
    const [orders, setOrders] = useState(null)
    const [returns, setReturns] = useState(null)
    const inputRef = useRef()
    const returnRef = useRef()

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!orders) return
        const fd = new FormData()
        fd.append('orders_file', orders)
        if (returns) fd.append('returns_file', returns)
        onSubmit(fd)
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold">Configure Analysis</h2>
                <Settings size={18} className="text-slate-500" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Source Infrastructure</label>

                    {/* Orders Upload */}
                    <div
                        onClick={() => inputRef.current.click()}
                        onDragOver={handleDrag}
                        onDrop={(e) => {
                            handleDrag(e)
                            setOrders(e.dataTransfer.files[0])
                        }}
                        className={`group h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${orders ? 'border-primary/40 bg-primary/5' : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                            }`}
                    >
                        <input
                            ref={inputRef} type="file" className="hidden"
                            onChange={(e) => setOrders(e.target.files[0])}
                        />
                        {orders ? (
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                                <CheckCircle2 size={32} className="text-primary mx-auto mb-2" />
                                <p className="text-xs font-medium text-slate-300">{orders.name}</p>
                            </motion.div>
                        ) : (
                            <>
                                <div className="p-3 rounded-full bg-white/5 group-hover:bg-primary/10 transition-colors">
                                    <Upload size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect Orders CSV</p>
                            </>
                        )}
                    </div>

                    {/* Returns Upload */}
                    <div
                        onClick={() => returnRef.current.click()}
                        onDragOver={handleDrag}
                        onDrop={(e) => {
                            handleDrag(e)
                            setReturns(e.dataTransfer.files[0])
                        }}
                        className={`group h-24 rounded-2xl border border-dashed transition-all cursor-pointer flex items-center px-6 gap-4 ${returns ? 'border-primary/40 bg-primary/5' : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                            }`}
                    >
                        <input
                            ref={returnRef} type="file" className="hidden"
                            onChange={(e) => setReturns(e.target.files[0])}
                        />
                        <div className={`p-2 rounded-lg ${returns ? 'bg-primary/20' : 'bg-white/5'}`}>
                            <FileText size={16} className={returns ? 'text-primary' : 'text-slate-500'} />
                        </div>
                        <div className="flex-grow">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Returns Data</p>
                            <p className="text-[10px] text-slate-500">{returns ? returns.name : 'Optional supplementation'}</p>
                        </div>
                        {returns && <CheckCircle2 size={16} className="text-primary" />}
                    </div>
                </div>

                <button
                    disabled={!orders || loading}
                    className={`w-full h-14 rounded-2xl flex items-center justify-between px-8 font-bold transition-all ${!orders || loading
                            ? 'bg-white/5 text-slate-600 grayscale'
                            : 'bg-primary text-black shadow-[0_0_30px_rgba(45,212,191,0.2)] hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                >
                    <span className="uppercase tracking-widest text-[11px]">Initiate Neural Sync</span>
                    <ChevronRight size={18} />
                </button>
            </form>

            <AnimatePresence>
                {progress.pct > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-8 pt-8 border-t border-white/5"
                    >
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">{progress.label}</span>
                            <span className="text-[10px] font-mono text-slate-500">{Math.round(progress.pct)}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary shadow-[0_0_10px_var(--primary)]"
                                animate={{ width: `${progress.pct}%` }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        .h-32 { height: 8rem; }
        .h-24 { height: 6rem; }
        .h-14 { height: 3.5rem; }
        .border-dashed { border-style: dashed; }
        .border-2 { border-width: 2px; }
        .grayscale { filter: grayscale(100%); }
        .tracking-\\[0\\.2em\\] { letter-spacing: 0.2em; }
        .leading-none { line-height: 1; }
        .pt-8 { padding-top: 2rem; }
        .shadow-\\[0_0_10px_var\\(--primary\\)\\] { box-shadow: 0 0 10px #2DD4BF; }
      `}</style>
        </motion.div>
    )
}
