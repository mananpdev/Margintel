export default function Footer() {
    return (
        <footer style={{
            padding: '28px 0', borderTop: '1px solid var(--glass-border)',
            textAlign: 'center', marginTop: 'auto',
        }}>
            <div className="container">
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    Margintel v0.1 — AI Margin Intelligence Engine ·{' '}
                    <a href="/health" target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none' }}>API Health</a> ·{' '}
                    <a href="https://github.com/mananpdev/Margintel" target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none' }}>GitHub</a>
                </p>
            </div>
        </footer>
    )
}
