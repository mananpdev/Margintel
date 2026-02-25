import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'

const COLORS = ['#6366F1', '#ffffff', '#71717a', '#27272a', '#18181b', '#3f3f46']

export default function ResultsPanel({ report }) {
    const [activeTab, setActiveTab] = useState('summary')

    if (!report) {
        return (
            <div className="glass" style={{ height: '100%', minHeight: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.03), transparent 70%)' }} />
                <motion.div
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2rem',
                        background: 'rgba(255,255,255,0.02)'
                    }}
                >
                    <div style={{ width: '30px', height: '1px', background: 'var(--border)' }} />
                    <div style={{ width: '1px', height: '30px', background: 'var(--border)', position: 'absolute' }} />
                </motion.div>

                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#fff', marginBottom: '0.75rem' }}>
                        Ready for Analysis
                    </h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted)', maxWidth: '240px', margin: '0 auto', lineHeight: 1.5, fontWeight: 500 }}>
                        Upload transaction layers to generate strategic intelligence.
                    </p>
                </div>
            </div>
        )
    }

    const p = report.profiling || {}
    const rd = (report.modules || {}).revenue_dependency_risk || {}
    const dec = report.decision_output || {}
    const ri = (report.modules || {}).returns_intelligence || {}
    const actions = dec.ranked_actions || []

    const skuRevData = Object.entries(p.sku_revenue_breakdown || {}).slice(0, 5).map(([name, value]) => ({ name, value }))

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* Strategic Navigation */}
            <nav style={{ display: 'flex', gap: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                {['summary', 'risk models', 'recommendations'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: activeTab === t ? '#fff' : 'var(--muted)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            cursor: 'pointer',
                            position: 'relative',
                            padding: '0 0.25rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {t}
                        {activeTab === t && (
                            <motion.div
                                layoutId="active-indicator"
                                style={{ position: 'absolute', bottom: '-1.375rem', left: 0, right: 0, height: '1px', background: '#fff' }}
                            />
                        )}
                    </button>
                ))}
            </nav>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                    {activeTab === 'summary' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                <LuxuryMetric label="Gross Contribution" value={`$${(p.total_revenue / 1000).toFixed(1)}K`} />
                                <LuxuryMetric label="Estimated Leakage" value={`$${(p.total_refunds / 1000).toFixed(1)}K`} isNegative />
                                <LuxuryMetric label="Margin Integrity" value={rd.risk_level === 'high' ? 'DEGRADED' : 'OPTIMAL'} highlight={rd.risk_level === 'high'} />
                            </div>

                            <div className="glass" style={{ padding: '2.5rem', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                    <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                                        Revenue Signature Distribution
                                    </h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
                                    <div style={{ height: '320px', position: 'relative' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={skuRevData}
                                                    innerRadius={90}
                                                    outerRadius={120}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                >
                                                    {skuRevData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', fontFamily: 'var(--mono)', backdropFilter: 'blur(10px)' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                                    labelStyle={{ color: 'var(--muted)', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', fontSize: '9px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.1em' }}>TOTAL</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>100%</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {skuRevData.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: COLORS[i % COLORS.length] }} />
                                                    <span style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--mono)' }}>{s.name}</span>
                                                </div>
                                                <span style={{ fontWeight: 700, opacity: 0.8 }}>${(s.value / 1000).toFixed(1)}K</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'risk models' && (
                        <div className="glass" style={{ background: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Anomaly Registry</h3>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.01)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '1.25rem 2rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em' }}>SKU IDENTIFIER</th>
                                        <th style={{ padding: '1.25rem 2rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em' }}>RETURN INDEX</th>
                                        <th style={{ padding: '1.25rem 2rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em' }}>CAPITAL EXPOSURE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(p.high_return_skus || []).map((s, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} className="hover-row">
                                            <td style={{ padding: '1.25rem 2rem', fontFamily: 'var(--mono)', fontWeight: 600 }}>{s.sku}</td>
                                            <td style={{ padding: '1.25rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ flexGrow: 1, height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', width: '100px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', background: s.return_rate > 0.2 ? '#fff' : 'var(--accent)', width: `${s.return_rate * 100}%` }} />
                                                    </div>
                                                    <span style={{ fontWeight: 700, fontSize: '0.7rem' }}>{(s.return_rate * 100).toFixed(1)}%</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 2rem', fontWeight: 700 }}>${s.estimated_margin_risk?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <style>{`.hover-row:hover { background: rgba(255,255,255,0.02); }`}</style>
                            {(!p.high_return_skus || p.high_return_skus.length === 0) && (
                                <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                                    CORE SYSTEMS ANALYSIS: ZERO HIGH-RISK ANOMALIES DETECTED.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'recommendations' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="glass" style={{ padding: '2rem', background: 'var(--accent-soft)', borderColor: 'rgba(99,102,241,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                                    <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.1em' }}>AI Strategic Synthesis</h3>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500, lineHeight: 1.6 }}>
                                    LLM Intelligence has analyzed your return themes and revenue concentration. The following ranked actions prioritize contribution preservation and risk mitigation.
                                </p>
                            </div>

                            {actions.map((a, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass"
                                    style={{ padding: '2rem', borderLeftWidth: '4px', borderLeftColor: (a.expected_impact === 'high' ? '#fff' : 'rgba(255,255,255,0.1)') }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>0{i + 1}</span>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{a.title}</h4>
                                        </div>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', opacity: 0.8 }}>
                                            {a.expected_impact} impact
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem', fontWeight: 500 }}>
                                        {a.why_it_matters}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {a.how_to_execute?.map((s, j) => (
                                            <div key={j} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}>
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}

                            {actions.length === 0 && (
                                <div className="glass" style={{ padding: '6rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '2rem' }}>STRATEGIC DATA UNAVAILABLE</p>
                                    <div style={{ maxWidth: '300px', margin: '0 auto', padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>Ensure your OpenAI API configuration is active to enable LLM synthesis for this dashboard.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

function LuxuryMetric({ label, value, isNegative = false, highlight = false }) {
    return (
        <div className="glass" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                {label}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: isNegative ? 'var(--error)' : (highlight ? 'var(--accent)' : '#fff'), letterSpacing: '-0.03em' }}>
                {value}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
        </div>
    )
}
