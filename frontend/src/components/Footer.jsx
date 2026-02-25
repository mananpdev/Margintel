import Logo from './Logo'

export default function Footer() {
    return (
        <footer style={{
            padding: '5rem 0 3rem 0',
            borderTop: '1px solid var(--border)',
            marginTop: 'auto',
            backgroundColor: 'rgba(1, 1, 3, 0.4)',
            position: 'relative',
            zIndex: 10
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '4rem', alignItems: 'start', marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Logo size={20} fontSize="1rem" />
                        <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', lineHeight: 1.6, maxWidth: '300px' }}>
                            Synthesizing transaction streams into strategic intelligence. Optimized for margin preservation and revenue integrity.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <span className="mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--fg-muted)', letterSpacing: '0.1em' }}>PROTOCOL</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--fg-soft)', textDecoration: 'none' }}>API Documentation</a>
                            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--fg-soft)', textDecoration: 'none' }}>Neural Architecture</a>
                            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--fg-soft)', textDecoration: 'none' }}>Privacy Standards</a>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <span className="mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--fg-muted)', letterSpacing: '0.1em' }}>RESOURCES</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <a href="/health" target="_blank" style={{ fontSize: '0.8rem', color: 'var(--fg-soft)', textDecoration: 'none' }}>System Health</a>
                            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--fg-soft)', textDecoration: 'none' }}>Github Node</a>
                            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--fg-soft)', textDecoration: 'none' }}>Terminal Access</a>
                        </div>
                    </div>
                </div>

                <div style={{ pt: '2rem', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2rem' }}>
                    <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--fg-muted)' }}>&copy; 2026 MARGINTEL_CORE // 0.1.0-STABLE</span>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', opacity: 0.5 }} />
                        <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--fg-muted)' }}>NODES_SYNCED</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
