export default function Footer() {
    return (
        <footer className="py-12 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
            <div className="container">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Margintel</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Autonomous Margin Intelligence Engine</p>
                    </div>

                    <div className="flex gap-10">
                        <a href="/health" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Infrastructure Status</a>
                        <a href="https://github.com/mananpdev/Margintel" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Core Repository</a>
                    </div>

                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        &copy; 2026 Margintel Intel Layer
                    </div>
                </div>
            </div>
            <style>{`
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
        .bg-black\\/40 { background-color: rgba(0, 0, 0, 0.4); }
        .md\\:flex-row { flex-direction: row; }
        .gap-10 { gap: 2.5rem; }
      `}</style>
        </footer>
    )
}
