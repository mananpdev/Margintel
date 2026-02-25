import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = ['#06B6D4', '#818cf8', '#a78bfa', '#f0f0f5', '#8b8b9e', '#3f3f56']

export default function ResultsPanel({ report, loading }) {
    const [activeTab, setActiveTab] = useState('summary')

    // ── Loading skeleton (#9) ──
    if (loading) {
        return (
            <div className="glass" style={{ minHeight: '480px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Pulse animation */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {[1, 2, 3, 4].map(i => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                                style={{
                                    flex: 1,
                                    height: '100px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border)'
                                }}
                            />
                        ))}
                    </div>
                    {[1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            style={{
                                height: i === 1 ? '200px' : '120px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border)'
                            }}
                        />
                    ))}
                </div>
                <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, textAlign: 'center' }}>
                    <motion.p
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}
                    >
                        Processing Intelligence Pipeline
                    </motion.p>
                </div>
            </div>
        )
    }

    // ── Empty state ──
    if (!report) {
        return (
            <div className="glass" style={{ height: '100%', minHeight: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.03), transparent 70%)' }} />
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

    // ── Error boundary: safe data extraction (#2) ──
    let p, rd, dec, ri, actions, skuRevData, concentrationData
    try {
        p = report.profiling || {}
        rd = (report.modules || {}).revenue_dependency_risk || {}
        dec = report.decision_output || {}
        ri = (report.modules || {}).returns_intelligence || {}
        actions = dec.ranked_actions || []

        skuRevData = Object.entries(p.sku_revenue_breakdown || {}).slice(0, 5).map(([name, value]) => ({ name, value }))

        // Build concentration data for bar chart (#12)
        const cm = rd.concentration_metrics || {}
        concentrationData = [
            { name: 'Top 1', value: Math.round((cm.top1 || 0) * 100), fill: '#06B6D4' },
            { name: 'Top 3', value: Math.round((cm.top3 || 0) * 100), fill: '#818cf8' },
            { name: 'Top 5', value: Math.round((cm.top5 || 0) * 100), fill: '#a78bfa' },
        ]
    } catch (err) {
        return (
            <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--error)', marginBottom: '1rem' }}>Report Data Error</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>The report structure could not be parsed. Try running a new analysis.</p>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem', fontFamily: 'var(--mono)' }}>{String(err)}</p>
            </div>
        )
    }

    const tabs = ['summary', 'risk models', 'recommendations']

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Tab Navigation */}
            <div className="glass" style={{ display: 'flex', padding: '6px', gap: '4px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                            color: activeTab === tab ? '#fff' : 'var(--muted)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'summary' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                <LuxuryMetric label="Gross Contribution" value={`$${((p.total_revenue || 0) / 1000).toFixed(1)}K`} />
                                <LuxuryMetric label="Avg Order Value" value={`$${(p.aov || 0).toFixed(0)}`} />
                                <LuxuryMetric label="Estimated Leakage" value={`$${((p.total_refunds || 0) / 1000).toFixed(1)}K`} isNegative />
                                <LuxuryMetric label="Margin Integrity" value={rd.risk_level === 'high' ? 'DEGRADED' : 'OPTIMAL'} highlight={rd.risk_level === 'high'} />
                            </div>

                            {/* Charts Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {/* SKU Revenue Pie */}
                                {skuRevData.length > 0 && (
                                    <div className="glass" style={{ padding: '2rem' }}>
                                        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
                                            Revenue Distribution
                                        </h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie data={skuRevData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} strokeWidth={0}>
                                                    {skuRevData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.7rem' }}
                                                    formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Revenue Concentration Bar (#12) */}
                                <div className="glass" style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
                                        Revenue Concentration
                                    </h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={concentrationData} layout="vertical" margin={{ left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 10 }} tickFormatter={(v) => `${v}%`} axisLine={false} />
                                            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} width={45} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                                {concentrationData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                                            </Bar>
                                            <RechartsTooltip
                                                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.7rem' }}
                                                formatter={(v) => [`${v}%`, 'Share']}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Level</span>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                color: rd.risk_level === 'high' ? 'var(--error)' : rd.risk_level === 'medium' ? '#f59e0b' : 'var(--success)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em'
                                            }}>
                                                {rd.risk_level || 'low'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dataset Summary */}
                            {report.dataset_summary && (
                                <div className="glass" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '1rem' }}>Dataset Summary</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                        <MiniStat label="Orders" value={report.dataset_summary.orders_rows?.toLocaleString()} />
                                        <MiniStat label="Returns" value={report.dataset_summary.returns_rows?.toLocaleString()} />
                                        <MiniStat label="Date Range" value={report.dataset_summary.date_range?.start ? `${report.dataset_summary.date_range.start} → ${report.dataset_summary.date_range.end}` : '—'} />
                                        <MiniStat label="Currency" value={report.dataset_summary.currency} />
                                    </div>
                                    {(report.dataset_summary.notes || []).length > 0 && (
                                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                                            {report.dataset_summary.notes.map((n, i) => (
                                                <p key={i} style={{ fontSize: '0.65rem', color: 'var(--muted)', lineHeight: 1.6, fontFamily: 'var(--mono)' }}>⚠ {n}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'risk models' && (
                        <>
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
                                                            <div style={{ height: '100%', background: s.return_rate > 0.2 ? '#fff' : 'var(--accent)', width: `${Math.min(s.return_rate * 100, 100)}%` }} />
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

                            {/* Return Reason Themes */}
                            {(ri.themes || []).length > 0 && (
                                <div className="glass" style={{ background: 'rgba(255,255,255,0.01)', marginTop: '1.5rem' }}>
                                    <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
                                        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Return Pattern Themes</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {ri.themes.map((t, i) => (
                                            <div key={i} style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                                <div style={{ minWidth: '36px', height: '36px', borderRadius: '8px', background: `rgba(255,255,255,${0.02 + (t.severity || 0) * 0.02})`, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--mono)' }}>
                                                    {t.severity}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t.theme}</div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                                        {(t.examples || []).map((ex, j) => (
                                                            <span key={j} style={{ fontSize: '0.65rem', padding: '3px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--muted)' }}>{ex}</span>
                                                        ))}
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                                                        SKUs: {(t.skus_affected || []).join(', ')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dependency Signals */}
                            {(rd.signals || []).length > 0 && (
                                <div className="glass" style={{ background: 'rgba(255,255,255,0.01)', marginTop: '1.5rem' }}>
                                    <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
                                        <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dependency Signals</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {rd.signals.map((sig, i) => (
                                            <div key={i} style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--mono)', fontWeight: 600 }}>{sig.signal}</span>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>threshold: {sig.threshold}</span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: sig.value > sig.threshold ? 'var(--error)' : 'var(--success)' }}>
                                                        {(sig.value * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
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
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{a.title}</h4>
                                        </div>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', opacity: 0.8, flexShrink: 0 }}>
                                            {a.expected_impact} impact
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem', fontWeight: 500 }}>
                                        {a.why_it_matters}
                                    </p>

                                    {/* Execution Steps */}
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                        {a.how_to_execute?.map((s, j) => (
                                            <div key={j} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}>
                                                {s}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Evidence + Confidence */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {(a.evidence_used || []).slice(0, 3).map((ev, j) => (
                                                <span key={j} style={{ fontSize: '0.6rem', padding: '2px 8px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '4px', color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{ev}</span>
                                            ))}
                                        </div>
                                        {a.confidence != null && (
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                                                conf: {(a.confidence * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Limitations & Next Questions */}
                            {(dec.limitations?.length > 0 || dec.next_questions?.length > 0) && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {dec.limitations?.length > 0 && (
                                        <div className="glass" style={{ padding: '1.5rem' }}>
                                            <h4 style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: '1rem' }}>Limitations</h4>
                                            {dec.limitations.map((l, i) => (
                                                <p key={i} style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>• {l}</p>
                                            ))}
                                        </div>
                                    )}
                                    {dec.next_questions?.length > 0 && (
                                        <div className="glass" style={{ padding: '1.5rem' }}>
                                            <h4 style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: '1rem' }}>Follow-Up Questions</h4>
                                            {dec.next_questions.map((q, i) => (
                                                <p key={i} style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>→ {q}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

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

function MiniStat({ label, value }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--mono)' }}>{value || '—'}</span>
        </div>
    )
}
