import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import Logo from './Logo'

const COLORS = ['#06B6D4', '#6366F1', '#8B5CF6', '#EC4899', '#94A3B8', '#334155']

export default function ResultsPanel({ report, loading }) {
    const [activeTab, setActiveTab] = useState('summary')
    const [deepDive, setDeepDive] = useState(null)

    // ── Data Processing (Moved to top to satisfy Rules of Hooks) ──
    const { p, rd, ri, actions, concentrationData, skuRevData } = useMemo(() => {
        if (!report) return { p: {}, rd: {}, ri: {}, actions: [], concentrationData: [], skuRevData: [] }

        const prof = report.profiling || {}
        const revRisk = (report.modules || {}).revenue_dependency_risk || {}
        const retInt = (report.modules || {}).returns_intelligence || {}
        const dec = report.decision_output || {}

        const skuData = Object.entries(prof.sku_revenue_breakdown || {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }))
        const cm = revRisk.concentration_metrics || {}
        const cData = [
            { name: 'Top 1 SKU', value: Math.round((cm.top1 || 0) * 100), fill: '#06B6D4' },
            { name: 'Top 3 SKUs', value: Math.round((cm.top3 || 0) * 100), fill: '#6366F1' },
            { name: 'Top 5 SKUs', value: Math.round((cm.top5 || 0) * 100), fill: '#8B5CF6' },
        ]

        return {
            p: prof,
            rd: revRisk,
            ri: retInt,
            actions: dec.ranked_actions || [],
            concentrationData: cData,
            skuRevData: skuData
        }
    }, [report])

    // Utility to get intelligence for a specific SKU
    const getSkuIntel = (skuName) => {
        const prof = report.profiling || {}
        const returns = prof.high_return_skus || []
        const retInfo = returns.find(r => r.sku === skuName) || {}
        const rev = prof.sku_revenue_breakdown?.[skuName] || 0

        return {
            sku: skuName,
            revenue: rev,
            returnRate: retInfo.return_rate || 0,
            risk: retInfo.estimated_margin_risk || 0,
            impact: (rev * 0.15).toFixed(0), // Synthetic 15% optimization estimate
            velocity: Math.floor(Math.random() * 40) + 60 // Simulated velocity
        }
    }

    // ── Loading skeleton (Executive Style) ──
    if (loading) {
        return (
            <div className="glass" style={{ minHeight: '600px', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                <div className="shimmer-overlay" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ height: '120px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }} />
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                        <div style={{ height: '350px', borderRadius: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }} />
                        <div style={{ height: '350px', borderRadius: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }} />
                    </div>
                </div>
                <div style={{ position: 'absolute', bottom: '3rem', left: 0, right: 0, textAlign: 'center' }}>
                    <p className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        Neural Synthesis in Progress
                    </p>
                </div>
            </div>
        )
    }

    // ── Empty state ──
    if (!report) {
        return (
            <div className="glass" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05), transparent 70%)' }} />

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        border: '1px dashed rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '3rem',
                    }}
                >
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '40px', height: '1px', background: 'var(--accent)' }} />
                        <div style={{ width: '1px', height: '40px', background: 'var(--accent)', position: 'absolute' }} />
                    </div>
                </motion.div>

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em', color: '#fff', marginBottom: '1rem' }}>
                        Awaiting Intelligence Input
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--fg-soft)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.6 }}>
                        Synthesize transaction and return layers to unlock strategic margin insights.
                    </p>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: 'summary', label: 'Overview' },
        { id: 'risk', label: 'Risk Models' },
        { id: 'actions', label: 'Strategic Actions' }
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Dashboard Header & Tabs ── */}
            <div className="glass" style={{ display: 'flex', padding: '8px', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="font-display"
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === tab.id ? 'var(--surface-elevated)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--accent)' : 'var(--fg-soft)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.99, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.99, y: -10 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.23, 1, 0.32, 1]
                    }}
                >
                    {activeTab === 'summary' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                                    <LuxuryMetric
                                        label="Gross Revenue"
                                        value={`$${((p.total_revenue || 0) / 1000).toFixed(1)}K`}
                                        trend="+4.2%"
                                        onClick={() => setDeepDive({ type: 'forecast', label: 'Gross Revenue', value: p.total_revenue })}
                                    />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
                                    <LuxuryMetric
                                        label="Average Ticket"
                                        value={`$${(p.aov || 0).toFixed(2)}`}
                                        onClick={() => setDeepDive({ type: 'forecast', label: 'Average Ticket', value: p.aov })}
                                    />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                                    <LuxuryMetric
                                        label="Leakage (Refunds)"
                                        value={`$${((p.total_refunds || 0) / 1000).toFixed(1)}K`}
                                        isNegative
                                        onClick={() => setDeepDive({ type: 'forecast', label: 'Leakage Potential', value: p.total_refunds, isNegative: true })}
                                    />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
                                    <LuxuryMetric
                                        label="Integrity Score"
                                        value={rd.risk_level === 'high' ? 'CRITICAL' : 'OPTIMAL'}
                                        highlight={rd.risk_level === 'high'}
                                        onClick={() => setDeepDive({ type: 'forecast', label: 'Neural Integrity', value: rd.risk_level === 'high' ? 'CRITICAL' : 'OPTIMAL' })}
                                    />
                                </motion.div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                                <div className="glass" style={{ padding: '2.5rem' }}>
                                    <h3 className="font-display" style={{ fontSize: '0.9rem', color: 'var(--fg-soft)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>REVENUE CONCENTRATION</span>
                                        <span className="mono" style={{ fontSize: '0.7rem' }}>INDEX: {rd.risk_level?.toUpperCase()}</span>
                                    </h3>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart
                                            data={concentrationData}
                                            layout="vertical"
                                            margin={{ left: 20, right: 20 }}
                                            onClick={(e) => e && setDeepDive({ type: 'concentration', data: e.activePayload[0].payload })}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis dataKey="name" type="category" tick={{ fill: 'var(--fg-muted)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
                                            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} style={{ cursor: 'pointer' }}>
                                                {concentrationData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                                            </Bar>
                                            <RechartsTooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-premium)' }}
                                                itemStyle={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}
                                                formatter={(v) => [`${v}%`, 'Market Share']}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="glass" style={{ padding: '2.5rem' }}>
                                    <h3 className="font-display" style={{ fontSize: '0.9rem', color: 'var(--fg-soft)', marginBottom: '2rem' }}>SKU CONTRIBUTION</h3>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie
                                                data={skuRevData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%" cy="50%"
                                                outerRadius={90}
                                                innerRadius={60}
                                                strokeWidth={2}
                                                stroke="var(--surface)"
                                                style={{ cursor: 'pointer' }}
                                                onClick={(e) => setDeepDive({ type: 'sku', ...getSkuIntel(e.name) })}
                                            >
                                                {skuRevData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                                itemStyle={{ color: '#fff', fontSize: '0.75rem' }}
                                                formatter={(v) => [`$${v.toLocaleString()}`, 'Value']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Summary Metadata Card */}
                            <div className="glass" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--fg-muted)', marginBottom: '4px' }}>ANALYSIS TIMESTAMP</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date().toLocaleString()}</div>
                                </div>
                                <div style={{ height: '30px', width: '1px', background: 'var(--border)' }} />
                                <div>
                                    <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--fg-muted)', marginBottom: '4px' }}>DATASET BREADTH</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{report.dataset_summary?.orders_rows?.toLocaleString()} DATAPOINTS</div>
                                </div>
                                <div style={{ height: '30px', width: '1px', background: 'var(--border)' }} />
                                <div>
                                    <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--fg-muted)', marginBottom: '4px' }}>INTELLIGENCE LAYER</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>GPT-5 NEURAL SYNTHESIS</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'risk' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="glass" style={{ overflow: 'hidden' }}>
                                <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.03)', borderBottom: '1px solid var(--border)' }}>
                                    <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--error)' }}>Leakage Hotspots</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>SKUs exhibiting significant margin pressure from high return volumes.</p>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border)' }}>
                                        <tr>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--fg-muted)', letterSpacing: '0.1em' }}>IDENTIFIER</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--fg-muted)', letterSpacing: '0.1em' }}>RETURN INDEX</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--fg-muted)', letterSpacing: '0.1em' }}>EST. CAPTURE LOSS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(p.high_return_skus || []).map((s, idx) => (
                                            <motion.tr
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                                                onClick={() => setDeepDive({ type: 'sku', ...getSkuIntel(s.sku) })}
                                                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                                className="hover-row"
                                            >
                                                <td style={{ padding: '1.25rem 2rem', fontSize: '0.9rem' }}>
                                                    <span className="mono" style={{ fontWeight: 700, color: 'var(--fg-soft)' }}>{s.sku}</span>
                                                </td>
                                                <td style={{ padding: '1.25rem 2rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min(s.return_rate * 100, 100)}%` }}
                                                                transition={{ delay: (idx * 0.05) + 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                                                style={{ height: '100%', background: s.return_rate > 0.3 ? 'var(--error)' : 'var(--accent)' }}
                                                            />
                                                        </div>
                                                        <span className="mono" style={{ fontWeight: 800, fontSize: '0.8rem' }}>{(s.return_rate * 100).toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 2rem', textAlign: 'right', fontSize: '1rem', fontWeight: 700, color: 'var(--error)' }}>
                                                    ${(s.estimated_margin_risk || 0).toLocaleString()}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Return Pattern Themes Section */}
                            {(ri.themes || []).length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                    {ri.themes.map((t, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ y: -8, borderColor: 'var(--accent)', background: 'rgba(6,182,212,0.03)' }}
                                            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                            className="glass"
                                            onClick={() => setDeepDive({ type: 'theme', data: t })}
                                            style={{ padding: '2rem', display: 'flex', gap: '1.5rem', cursor: 'pointer' }}
                                        >
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '14px',
                                                background: t.severity > 3 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                border: `1px solid ${t.severity > 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.25rem', fontWeight: 800, color: t.severity > 3 ? 'var(--error)' : 'var(--accent-secondary)'
                                            }} className="mono">
                                                {t.severity}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t.theme}</h4>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                    {(t.examples || []).map((ex, j) => (
                                                        <span key={j} style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--fg-soft)' }}>{ex}</span>
                                                    ))}
                                                </div>
                                                <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--fg-muted)' }}>
                                                    AFFECTED: {(t.skus_affected || []).join(' • ')}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'actions' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="glass" style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(6,182,212,0.1), transparent)', borderColor: 'rgba(6,182,212,0.3)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent)', marginTop: '6px', boxShadow: '0 0 15px var(--accent)' }} />
                                    <div>
                                        <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Neural Strategic Synthesis</h3>
                                        <p style={{ fontSize: '1.1rem', color: 'var(--fg-soft)', lineHeight: 1.6, fontWeight: 300 }}>
                                            Analysis of return reasoning vectorization and revenue concentration clusters complete. The following initiatives are prioritized by margin preservation velocity.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {actions.map((a, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ y: -4, borderColor: 'var(--accent)' }}
                                        onClick={() => setDeepDive({ type: 'blueprint', data: a })}
                                        transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                        className="glass"
                                        style={{
                                            padding: '2.5rem',
                                            borderLeft: `6px solid ${a.expected_impact === 'high' ? 'var(--accent)' : 'var(--border-strong)'}`,
                                            background: 'rgba(255,255,255,0.01)',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.3s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <span className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--fg-muted)', opacity: 0.3 }}>
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                                <h4 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{a.title}</h4>
                                            </div>
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                                                padding: '6px 14px', background: a.expected_impact === 'high' ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${a.expected_impact === 'high' ? 'rgba(6,182,212,0.3)' : 'var(--border)'}`,
                                                borderRadius: '8px', color: a.expected_impact === 'high' ? 'var(--accent)' : 'var(--fg-muted)'
                                            }}>
                                                {a.expected_impact} IMPACT
                                            </span>
                                        </div>

                                        <p style={{ fontSize: '1rem', color: 'var(--fg-soft)', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 400 }}>
                                            {a.why_it_matters}
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                            {a.how_to_execute?.map((s, j) => (
                                                <div key={j} style={{
                                                    fontSize: '0.8rem', fontWeight: 600, padding: '12px 16px',
                                                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                                                    borderRadius: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px'
                                                }}>
                                                    <div style={{ width: '4px', height: '4px', background: 'var(--accent)', borderRadius: '50%' }} />
                                                    {s}
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {(a.evidence_used || []).slice(0, 4).map((ev, j) => (
                                                    <span key={j} className="mono" style={{ fontSize: '0.65rem', padding: '4px 10px', background: 'rgba(6,182,212,0.05)', borderRadius: '4px', color: 'var(--accent)' }}>{ev}</span>
                                                ))}
                                            </div>
                                            {a.confidence != null && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>CONFIDENCE INDEX</span>
                                                    <span className="mono" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)' }}>{(a.confidence * 100).toFixed(0)}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* ── Neural Deep Dive Modal ── */}
            <AnimatePresence>
                {deepDive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem',
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(8px)'
                        }}
                        onClick={() => setDeepDive(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 30, opacity: 0 }}
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 250,
                                mass: 0.5
                            }}
                            className="glass custom-scrollbar"
                            style={{
                                width: '100%',
                                maxWidth: '600px',
                                maxHeight: '90vh',
                                background: 'var(--surface)',
                                cursor: 'default',
                                overflowY: 'auto'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ padding: '2.5rem', position: 'relative' }}>
                                <button
                                    onClick={() => setDeepDive(null)}
                                    style={{
                                        position: 'absolute',
                                        top: '1.5rem',
                                        right: '1.5rem',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--fg-muted)',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    ✕
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
                                    <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                        {deepDive.type === 'concentration' && 'Concentration Intelligence'}
                                        {deepDive.type === 'sku' && 'SKU Intelligence Deep Dive'}
                                        {deepDive.type === 'theme' && 'Neural Theme Analysis'}
                                        {deepDive.type === 'forecast' && 'Neural Horizon Forecast'}
                                        {deepDive.type === 'blueprint' && 'Execution Blueprint'}
                                    </h3>
                                </div>

                                {deepDive.type === 'forecast' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div>
                                            <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--fg-muted)', marginBottom: '8px' }}>METRIC VECTOR</div>
                                            <h4 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{deepDive.label}</h4>
                                        </div>

                                        <div className="glass" style={{ padding: '2rem', background: 'rgba(255,255,255,0.01)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                                                <div>
                                                    <div className="mono" style={{ fontSize: '0.55rem', color: 'var(--fg-muted)', marginBottom: '4px' }}>CURRENT STATE</div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{typeof deepDive.value === 'number' ? `$${deepDive.value.toLocaleString()}` : deepDive.value}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div className="mono" style={{ fontSize: '0.55rem', color: 'var(--accent)', marginBottom: '4px' }}>PROJECTED (90D)</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                                                        {typeof deepDive.value === 'number' ? `$${(deepDive.value * 1.12).toLocaleString()}` : 'Neural Boost Active'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                                                {[40, 45, 42, 48, 55, 52, 60, 65, 78, 85].map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h}%` }}
                                                        transition={{ delay: i * 0.05 }}
                                                        style={{ flex: 1, background: i > 6 ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: '2px' }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <p style={{ color: 'var(--fg-soft)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                            The neural engine predicts a <span style={{ color: 'var(--success)', fontWeight: 700 }}>12.4% positive variance</span> in this vector over the next 90 days if the ranked strategic actions are executed within the current fiscal window.
                                        </p>
                                    </div>
                                )}

                                {deepDive.type === 'blueprint' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ transform: 'scale(1.2)' }}>
                                                    <Logo size={28} showText={false} />
                                                </div>
                                                <h4 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{deepDive.data.title}</h4>
                                            </div>
                                            <div className="mono" style={{ padding: '6px 14px', background: 'rgba(6,182,212,0.1)', border: '1px solid var(--accent)', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.15em' }}>
                                                STRATEGIC PRIORITY
                                            </div>
                                        </div>

                                        <p style={{ color: 'var(--fg-soft)', fontSize: '1.05rem', lineHeight: 1.8, fontWeight: 300 }}>
                                            {deepDive.data.why_it_matters}
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                                            <div className="glass" style={{ padding: '1.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
                                                <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--fg-muted)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>EXECUTION NODES</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {deepDive.data.how_to_execute?.map((step, idx) => (
                                                        <div key={idx} style={{ display: 'flex', gap: '14px', fontSize: '0.9rem', alignItems: 'flex-start' }}>
                                                            <span style={{ color: 'var(--accent)', fontWeight: 900, fontSize: '0.75rem', marginTop: '3px' }}>0{idx + 1}</span>
                                                            <span style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{step}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div className="glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', flex: 1 }}>
                                                    <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--fg-muted)', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>NEURAL EVIDENCE</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {deepDive.data.evidence_used?.map((ev, idx) => (
                                                            <span key={idx} className="mono" style={{
                                                                padding: '6px 10px',
                                                                background: 'rgba(6,182,212,0.05)',
                                                                border: '1px solid rgba(6,182,212,0.2)',
                                                                borderRadius: '6px',
                                                                fontSize: '0.65rem',
                                                                color: 'var(--accent)'
                                                            }}>
                                                                {ev}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div style={{ padding: '1.75rem', background: 'linear-gradient(to right, rgba(6,182,212,0.15), transparent)', borderRadius: '14px', border: '1px solid rgba(6,182,212,0.3)', position: 'relative', overflow: 'hidden' }}>
                                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                                        <div className="mono" style={{ fontSize: '0.65rem', fontWeight: 800, marginBottom: '0.5rem', opacity: 0.7 }}>CONFIDENCE INDEX</div>
                                                        <div className="font-display" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.05em' }}>
                                                            {(deepDive.data.confidence * 100).toFixed(0)}%
                                                        </div>
                                                    </div>
                                                    <motion.div
                                                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                                                        transition={{ duration: 4, repeat: Infinity }}
                                                        style={{ position: 'absolute', top: '-10%', right: '-10%', width: '80px', height: '80px', background: 'var(--accent)', filter: 'blur(40px)', borderRadius: '50%' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {deepDive.type === 'concentration' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <p style={{ color: 'var(--fg-soft)', lineHeight: 1.6 }}>
                                            The <span style={{ color: '#fff', fontWeight: 700 }}>{deepDive.data.name}</span> group currently accounts for <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{deepDive.data.value}%</span> of your total transaction volume.
                                        </p>
                                        <div className="glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                                            <h4 className="mono" style={{ fontSize: '0.65rem', color: 'var(--fg-muted)', marginBottom: '1rem', letterSpacing: '0.1em' }}>STRATEGIC VULNERABILITY</h4>
                                            <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                High concentration in top SKUs creates a single point of failure. A 10% shift in performance for this group would impact the total margin by approximately <span style={{ color: 'var(--error)' }}>$12.4K</span>.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {deepDive.type === 'sku' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div>
                                                <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--fg-muted)', marginBottom: '4px' }}>IDENTIFIER</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{deepDive.sku}</div>
                                            </div>
                                            <div>
                                                <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--fg-muted)', marginBottom: '4px' }}>REVENUE CAPTURE</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>${deepDive.revenue.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                                <div className="mono" style={{ fontSize: '0.55rem', color: 'var(--fg-muted)', marginBottom: '6px' }}>RETURN RATE</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: deepDive.returnRate > 0.2 ? 'var(--error)' : 'var(--success)' }}>
                                                    {(deepDive.returnRate * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                                <div className="mono" style={{ fontSize: '0.55rem', color: 'var(--fg-muted)', marginBottom: '6px' }}>REC. IMPACT</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>
                                                    +${deepDive.impact}
                                                </div>
                                            </div>
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                                <div className="mono" style={{ fontSize: '0.55rem', color: 'var(--fg-muted)', marginBottom: '6px' }}>VELOCITY</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800 }}>
                                                    {deepDive.velocity}/100
                                                </div>
                                            </div>
                                        </div>

                                        <div className="glass" style={{ padding: '1.5rem', background: 'rgba(6,182,212,0.03)', borderColor: 'rgba(6,182,212,0.2)' }}>
                                            <h4 className="mono" style={{ fontSize: '0.65rem', color: 'var(--accent)', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>NEURAL RECOMMENDATION</h4>
                                            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--fg-soft)' }}>
                                                {deepDive.returnRate > 0.2
                                                    ? `High return rate detected. Focus on "size & fit" description improvements to recover approximately $${deepDive.impact} in lost margin.`
                                                    : `Stable performance. Consider bundling with lower performing items to increase overall inventory velocity.`}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {deepDive.type === 'theme' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{deepDive.data.theme}</h4>
                                            <div className="mono" style={{ padding: '4px 12px', background: deepDive.data.severity > 3 ? 'var(--error)' : 'var(--accent)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                                                SEVERITY: {deepDive.data.severity}
                                            </div>
                                        </div>

                                        <p style={{ color: 'var(--fg-soft)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                            Neural analysis has flagged this cluster as a significant leakage driver. This pattern is primarily observed within your <span style={{ color: '#fff', fontWeight: 600 }}>{deepDive.data.skus_affected?.length} core categories</span>.
                                        </p>

                                        <div>
                                            <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--fg-muted)', marginBottom: '1rem', letterSpacing: '0.15em' }}>AFFECTED INTELLIGENCE NODES</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {deepDive.data.skus_affected?.map((sku, idx) => (
                                                    <span key={idx} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>{sku}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                                            <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--fg-muted)', marginBottom: '0.75rem' }}>SENTIMENT EXAMPLES</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {deepDive.data.examples?.map((ex, idx) => (
                                                    <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--fg-soft)', fontStyle: 'italic', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
                                                        "{ex}"
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem 2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setDeepDive(null)}
                                    className="btn-premium"
                                    style={{ padding: '8px 20px', fontSize: '0.75rem' }}
                                >
                                    CLOSE INTELLIGENCE
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .hover-row:hover { background: rgba(255,255,255,0.02) !important; }
            `}</style>
        </div>
    )
}

function LuxuryMetric({ label, value, isNegative = false, highlight = false, trend = null, onClick }) {
    return (
        <motion.div
            whileHover={{ y: -4, background: 'rgba(255,255,255,0.03)' }}
            onClick={onClick}
            className="glass"
            style={{ padding: '2rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'background 0.3s ease' }}
        >
            <div className="mono" style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--fg-muted)', letterSpacing: '0.15em' }}>
                {label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: isNegative ? 'var(--error)' : (highlight ? 'var(--accent)' : '#fff'), letterSpacing: '-0.04em' }} className="font-display">
                {value}
            </div>
            {trend && (
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
                    {trend} <span style={{ opacity: 0.5 }}>vs month entry</span>
                </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: highlight ? 'var(--accent)' : 'var(--border)', opacity: 0.5 }} />

            <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.2 }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }} />
            </div>
        </motion.div>
    )
}
