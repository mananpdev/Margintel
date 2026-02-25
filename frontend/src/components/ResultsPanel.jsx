import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingDown, Target, Code2, Download, ChevronRight, AlertTriangle, HelpCircle } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'

const COLORS = ['#6384ff', '#a370f7', '#f471b5', '#4ade80', '#facc15', '#fb7185', '#60a5fa', '#c084fc']
const fmt = v => `$${(v || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const pct = v => `${((v || 0) * 100).toFixed(1)}%`

function MetricCard({ label, value, color, note, delay = 0 }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay }}
            whileHover={{ y: -4, borderColor: 'rgba(99,132,255,.3)' }}
            className="glass"
            style={{ padding: 18, position: 'relative', overflow: 'hidden', cursor: 'default' }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--grad)', opacity: 0, transition: 'opacity .3s' }}
                className="metric-bar" />
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, color }}>{value}</div>
            {note && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{note}</div>}
            <style>{`.glass:hover .metric-bar { opacity: 1 !important; }`}</style>
        </motion.div>
    )
}

function RiskBadge({ level }) {
    const colors = { high: { bg: 'var(--red-dim)', color: 'var(--red)', border: 'rgba(251,113,133,.25)' }, medium: { bg: 'var(--yellow-dim)', color: 'var(--yellow)', border: 'rgba(250,204,21,.25)' }, low: { bg: 'var(--green-dim)', color: 'var(--green)', border: 'rgba(74,222,128,.25)' } }
    const c = colors[level] || colors.low
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{level}</span>
}

function TabButton({ active, icon, label, onClick }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                flex: 1, padding: '10px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: 600, border: 'none', fontFamily: 'var(--font)',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: active ? 'var(--bg-2)' : 'transparent',
                color: active ? 'var(--text-1)' : 'var(--text-3)',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,.3)' : 'none',
            }}
        >
            {icon}{label}
        </motion.button>
    )
}

export default function ResultsPanel({ report, onDownload }) {
    const [tab, setTab] = useState('overview')

    if (!report) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 480, textAlign: 'center', color: 'var(--text-3)' }}
            >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} style={{ fontSize: 48, marginBottom: 14, opacity: .4 }}>📈</motion.div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>No Report Yet</h3>
                <p style={{ fontSize: 13, maxWidth: 280, lineHeight: 1.6 }}>Upload your CSV data and run analysis to generate your margin intelligence report.</p>
            </motion.div>
        )
    }

    const p = report.profiling || {}
    const ds = report.dataset_summary || {}
    const ri = (report.modules || {}).returns_intelligence || {}
    const rd = (report.modules || {}).revenue_dependency_risk || {}
    const dec = report.decision_output || {}
    const cm = rd.concentration_metrics || {}
    const hrs = p.high_return_skus || []
    const themes = ri.themes || []
    const trs = ri.top_risk_skus || []
    const actions = dec.ranked_actions || []
    const skuRev = p.sku_revenue_breakdown || {}

    // Chart data
    const skuPieData = Object.entries(skuRev).slice(0, 8).map(([name, value]) => ({ name, value: Math.round(value) }))
    const concData = [{ name: 'Top 1', value: (cm.top1 || 0) * 100 }, { name: 'Top 3', value: (cm.top3 || 0) * 100 }, { name: 'Top 5', value: (cm.top5 || 0) * 100 }]
    const returnsData = hrs.slice(0, 7).map(s => ({ sku: s.sku, rate: +(s.return_rate * 100).toFixed(1), risk: Math.round(s.estimated_margin_risk) }))

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Summary Banner */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass"
                style={{ padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, background: 'linear-gradient(135deg, rgba(99,132,255,.06) 0%, rgba(163,112,247,.04) 100%)' }}
            >
                <div><div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Run ID</div><div className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{(report.run_id || '').slice(0, 13)}…</div></div>
                <div><div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Date Range</div><div style={{ fontSize: 13, fontWeight: 600 }}>{ds.date_range?.start || '—'} → {ds.date_range?.end || '—'}</div></div>
                <div><div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Dataset</div><div style={{ fontSize: 13, fontWeight: 600 }}>{ds.orders_rows || 0} orders · {ds.returns_rows || 0} returns</div></div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onDownload(report.run_id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid var(--glass-border)', borderRadius: 8, background: 'transparent', color: 'var(--text-2)', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                ><Download size={14} />Download</motion.button>
            </motion.div>

            {/* Notes */}
            {ds.notes?.length > 0 && (
                <div>{ds.notes.map((n, i) => <div key={i} style={{ padding: '7px 12px', background: 'var(--yellow-dim)', border: '1px solid rgba(250,204,21,.15)', borderRadius: 6, fontSize: 12, color: 'var(--yellow)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={13} />{n}</div>)}</div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-1)', borderRadius: 10, padding: 4, overflowX: 'auto' }}>
                <TabButton active={tab === 'overview'} icon={<BarChart3 size={14} />} label="Overview" onClick={() => setTab('overview')} />
                <TabButton active={tab === 'returns'} icon={<TrendingDown size={14} />} label="Returns" onClick={() => setTab('returns')} />
                <TabButton active={tab === 'actions'} icon={<Target size={14} />} label="Actions" onClick={() => setTab('actions')} />
                <TabButton active={tab === 'raw'} icon={<Code2 size={14} />} label="Raw JSON" onClick={() => setTab('raw')} />
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {tab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
                            <MetricCard label="Total Revenue" value={fmt(p.total_revenue)} color="var(--green)" note={ds.currency || 'CAD'} delay={0} />
                            <MetricCard label="Total Refunds" value={fmt(p.total_refunds)} color="var(--red)" note={p.total_revenue ? `${pct(p.total_refunds / p.total_revenue)} of revenue` : '0%'} delay={.05} />
                            <MetricCard label="Avg Order Value" value={fmt(p.aov)} color="var(--blue)" note="per order" delay={.1} />
                            <MetricCard label="Revenue Risk" value={<RiskBadge level={rd.risk_level || 'low'} />} note="concentration" delay={.15} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }} className="glass" style={{ padding: 20 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>📊 Revenue by SKU</div>
                                {skuPieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={skuPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0} animationBegin={200} animationDuration={800}>
                                                {skuPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid rgba(65,90,150,.3)', borderRadius: 8, fontSize: 12, color: '#94a8cc' }} formatter={v => fmt(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : <p style={{ color: 'var(--text-3)', fontSize: 12, textAlign: 'center', padding: 40 }}>No SKU data</p>}
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }} className="glass" style={{ padding: 20 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>📈 Concentration</div>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={concData}>
                                        <XAxis dataKey="name" tick={{ fill: '#5a6e8a', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 100]} tick={{ fill: '#5a6e8a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'} />
                                        <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid rgba(65,90,150,.3)', borderRadius: 8, fontSize: 12, color: '#94a8cc' }} formatter={v => v.toFixed(1) + '%'} />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={800}>
                                            {concData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>

                        {/* Revenue risk signals */}
                        {rd.signals?.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .4 }} style={{ marginTop: 14 }}>
                                {rd.signals.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--yellow-dim)', border: '1px solid rgba(250,204,21,.12)', borderRadius: 6, fontSize: 12, color: 'var(--yellow)', marginBottom: 5 }}>
                                        🚨 <span className="mono">{s.signal}</span> — <b>{pct(s.value)}</b> (threshold: {pct(s.threshold)})
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {tab === 'returns' && (
                    <motion.div key="returns" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {returnsData.length > 0 && (
                            <div className="glass" style={{ padding: 20 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🔥 Return Rate vs Margin Risk by SKU</div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={returnsData}>
                                        <XAxis dataKey="sku" tick={{ fill: '#5a6e8a', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#5a6e8a', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ background: '#111a2e', border: '1px solid rgba(65,90,150,.3)', borderRadius: 8, fontSize: 12, color: '#94a8cc' }} />
                                        <Bar dataKey="rate" name="Return Rate %" fill="#fb7185" radius={[4, 4, 0, 0]} animationDuration={600} />
                                        <Bar dataKey="risk" name="Margin Risk $" fill="#facc15" radius={[4, 4, 0, 0]} animationDuration={600} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {hrs.length > 0 && (
                            <div className="glass" style={{ padding: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>🔥 High Return SKUs</div>
                                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{hrs.length} flagged</span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                        <thead><tr>{['SKU', 'Return Rate', 'Revenue', 'Margin Risk'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, borderBottom: '1px solid var(--glass-border)' }}>{h}</th>)}</tr></thead>
                                        <tbody>{hrs.slice(0, 10).map((s, i) => (
                                            <motion.tr key={s.sku} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .05 }} style={{ borderBottom: '1px solid rgba(65,90,150,.15)' }}>
                                                <td className="mono" style={{ padding: '11px 12px', fontWeight: 600, color: 'var(--text-1)' }}>{s.sku}</td>
                                                <td style={{ padding: '11px 12px' }}><RiskBadge level={s.return_rate > .3 ? 'high' : s.return_rate > .15 ? 'medium' : 'low'} /> {pct(s.return_rate)}</td>
                                                <td style={{ padding: '11px 12px', color: 'var(--text-2)' }}>{fmt(s.revenue)}</td>
                                                <td style={{ padding: '11px 12px', color: 'var(--red)', fontWeight: 600 }}>{fmt(s.estimated_margin_risk)}</td>
                                            </motion.tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {themes.length > 0 && (
                            <div className="glass" style={{ padding: 20 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🧠 Return Themes <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 400, marginLeft: 4 }}>LLM</span></div>
                                <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {themes.map((t, i) => (
                                        <motion.span key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * .05 }}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: 'var(--bg-2)', border: '1px solid var(--glass-border)' }}
                                        >
                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.severity >= 4 ? 'var(--red)' : t.severity >= 3 ? 'var(--yellow)' : 'var(--green)' }} />
                                            {t.theme} <span style={{ color: 'var(--text-3)', fontSize: 10 }}>({t.severity}/5)</span>
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!hrs.length && !themes.length && (
                            <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No return data provided or no high-return SKUs detected.</div>
                        )}
                    </motion.div>
                )}

                {tab === 'actions' && (
                    <motion.div key="actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                        {actions.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {actions.map((a, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .08 }}
                                        whileHover={{ x: 4, borderColor: 'rgba(99,132,255,.25)' }}
                                        className="glass" style={{ padding: 18, position: 'relative', overflow: 'hidden', cursor: 'default' }}
                                    >
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', borderRadius: '4px 0 0 4px', background: a.expected_impact === 'high' ? 'var(--red)' : a.expected_impact === 'medium' ? 'var(--yellow)' : 'var(--blue)' }} />
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 6 }}>
                                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--grad)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{a.rank}</div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{a.title}</div>
                                                <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .4, marginTop: 3, background: a.action_type === 'data_fix' ? 'var(--blue-dim)' : a.action_type === 'business_experiment' ? 'var(--yellow-dim)' : 'rgba(163,112,247,.1)', color: a.action_type === 'data_fix' ? 'var(--blue)' : a.action_type === 'business_experiment' ? 'var(--yellow)' : 'var(--accent-2)' }}>
                                                    {(a.action_type || 'action').replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: 37, color: 'var(--text-2)', fontSize: 12, lineHeight: 1.65 }}>
                                            <div>{a.why_it_matters}</div>
                                            {a.how_to_execute?.length > 0 && (
                                                <div style={{ marginTop: 8 }}>
                                                    <b style={{ fontSize: 11, color: 'var(--text-3)' }}>Steps:</b>
                                                    <ul style={{ margin: '4px 0 0 16px', listStyle: 'disc' }}>{a.how_to_execute.map((s, j) => <li key={j}>{s}</li>)}</ul>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                                                <span>📊 <RiskBadge level={a.expected_impact || 'low'} /></span>
                                                <span>🎯 Confidence: <b style={{ color: 'var(--text-2)' }}>{((a.confidence || 0) * 100).toFixed(0)}%</b></span>
                                                {a.success_metric && <span>📐 {a.success_metric}</span>}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                                No ranked actions. Add an OpenAI API key for LLM-powered recommendations.
                            </div>
                        )}

                        {(dec.limitations?.length > 0 || dec.next_questions?.length > 0) && (
                            <div className="glass" style={{ padding: 20, marginTop: 14 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><HelpCircle size={15} /> Limitations & Next Steps</div>
                                {dec.limitations?.map((l, i) => <div key={i} style={{ padding: '6px 10px', background: 'var(--bg-2)', borderRadius: 6, fontSize: 12, color: 'var(--text-2)', marginBottom: 3 }}>• {l}</div>)}
                                {dec.next_questions?.map((q, i) => <div key={i} style={{ padding: '6px 10px', background: 'var(--blue-dim)', borderRadius: 6, fontSize: 12, color: 'var(--blue)', marginBottom: 3 }}>❓ {q}</div>)}
                            </div>
                        )}
                    </motion.div>
                )}

                {tab === 'raw' && (
                    <motion.div key="raw" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                        <div className="glass" style={{ padding: 20 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{'{ }'} Full JSON Report</div>
                            <pre className="mono" style={{
                                background: 'var(--bg-1)', border: '1px solid var(--glass-border)', borderRadius: 10,
                                padding: 18, maxHeight: 500, overflow: 'auto', fontSize: 11, lineHeight: 1.7,
                                color: 'var(--text-3)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            }}>
                                {JSON.stringify(report, null, 2)}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
