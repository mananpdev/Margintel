import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { LayoutGrid, TrendingUp, ArrowUpRight, CheckCircle2 } from 'lucide-react'

const COLORS = ['#2DD4BF', '#3B82F6', '#F43F5E', '#A855F7', '#F59E0B']

export default function ResultsPanel({ report }) {
    const [activeTab, setActiveTab] = useState('overview')

    if (!report) {
        return (
            <div className="h-full min-h-[600px] glass flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5" />
                <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-10 border border-white/5 shadow-inner">
                    <motion.div
                        animate={{ rotate: [0, 90, 180, 270, 360], borderRadius: ["2rem", "1rem", "2rem"] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <LayoutGrid className="text-slate-500" size={28} />
                    </motion.div>
                </div>
                <h3 className="text-3xl font-black tracking-tighter mb-4">Command Awaiting Input</h3>
                <p className="text-slate-500 max-w-sm text-sm leading-relaxed font-medium">Synchronize your logistical data streams to the command center to generate optimized fiscal intelligence.</p>
            </div>
        )
    }

    const p = report.profiling || {}
    const rd = (report.modules || {}).revenue_dependency_risk || {}
    const dec = report.decision_output || {}
    const actions = dec.ranked_actions || []

    const skuRevData = Object.entries(p.sku_revenue_breakdown || {}).slice(0, 5).map(([name, value]) => ({ name, value }))

    return (
        <div className="space-y-8">
            {/* Precision Navigation */}
            <div className="flex bg-white/5 p-2 rounded-[2rem] border border-white/5 backdrop-blur-3xl">
                {['overview', 'returns', 'actions'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === t ? 'text-black' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {activeTab === t && (
                            <motion.div
                                layoutId="tab-highlight"
                                className="absolute inset-0 bg-primary rounded-2xl z-0 shadow-[0_0_30px_rgba(45,212,191,0.4)]"
                            />
                        )}
                        <span className="relative z-10">{t}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="min-h-[500px]"
                >
                    {activeTab === 'overview' && (
                        <div className="bento-grid">
                            <div className="lg:col-span-8 grid grid-cols-2 gap-6">
                                <div className="glass p-8 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Aggregate Volume</span>
                                        <div className="p-1 px-2 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">+12%</div>
                                    </div>
                                    <div className="text-4xl font-black tracking-tighter">${(p.total_revenue / 1000).toFixed(1)}k</div>
                                </div>

                                <div className="glass p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Exposure Delta</span>
                                        <div className="p-1 px-2 rounded-lg bg-accent/10 text-accent text-[10px] font-bold">Risk</div>
                                    </div>
                                    <div className="text-4xl font-black tracking-tighter text-accent">${(p.total_refunds / 1000).toFixed(1)}k</div>
                                </div>

                                <div className="col-span-2 glass p-10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <TrendingUp size={120} className="text-primary" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-10">Revenue Distribution Scan</h3>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={skuRevData}
                                                        innerRadius={70}
                                                        outerRadius={100}
                                                        paddingAngle={10}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {skuRevData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />)}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(5, 10, 20, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                                                        itemStyle={{ fontSize: '11px', color: '#F8FAFC', fontWeight: 'bold' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                <div className="glass p-8 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${rd.risk_level === 'high' ? 'bg-accent' : 'bg-primary'}`} />
                                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6">Threat level</h3>
                                    <div className="flex items-end gap-3">
                                        <div className="text-5xl font-black uppercase tracking-tighter leading-none">{rd.risk_level || 'Low'}</div>
                                        <div className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Nominal</div>
                                    </div>
                                </div>

                                <div className="glass p-8 border-primary/20 bg-primary/5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <TrendingUp size={10} className="text-black" />
                                        </div>
                                        <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">Strategic Vector</h3>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed font-medium">Analysis indicates a 42% revenue dependency on top-tier inventory. Transitioning towards a diversified distribution strategy is prioritized.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'actions' && (
                        <div className="space-y-6">
                            {actions.map((a, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass p-8 flex gap-8 group hover:bg-white/[0.02] transition-all cursor-default"
                                >
                                    <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-primary/20 transition-colors">
                                        <span className="font-mono text-2xl font-black text-slate-600 group-hover:text-primary transition-colors">{i + 1}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-black text-xl tracking-tight mb-1">{a.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${a.expected_impact === 'high' ? 'bg-accent text-white' : 'bg-white/10 text-slate-400'}`}>
                                                        {a.expected_impact} IMPACT
                                                    </span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">•</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{a.action_type?.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <ArrowUpRight size={24} className="text-slate-800 group-hover:text-primary transition-colors" />
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">{a.why_it_matters}</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {a.how_to_execute?.slice(0, 2).map((s, j) => (
                                                <div key={j} className="flex items-center gap-3 text-[11px] text-slate-200 font-bold bg-white/5 p-3 rounded-2xl border border-white/5">
                                                    <CheckCircle2 size={14} className="text-primary" />
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <style>{`
        .tracking-\\[0\\.3em\\] { letter-spacing: 0.3em; }
        .min-h-\\[600px\\] { min-height: 600px; }
        .rounded-\\[2rem\\] { border-radius: 2rem; }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
        .text-3xl { font-size: 1.875rem; }
        .p-10 { padding: 2.5rem; }
        .h-72 { height: 18rem; }
        .leading-none { line-height: 1; }
        .shrink-0 { flex-shrink: 0; }
        .text-slate-800 { color: #1e293b; }
        .bg-white\\/\\[0\\.02\\] { background-color: rgba(255, 255, 255, 0.02); }
      `}</style>
        </div>
    )
}
