export default function Footer() {
    return (
        <footer style={{
            padding: '4rem 0',
            borderTop: '1px solid var(--border)',
            marginTop: 'auto',
            backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>Margintel</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Analytical Intelligence Platform</span>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <a href="/health" target="_blank" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>System Health</a>
                        <a href="https://github.com/mananpdev/Margintel" target="_blank" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Protocol</a>
                    </div>

                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>&copy; 2026 Margintel Inc.</span>
                </div>
            </div>
        </footer>
    )
}
