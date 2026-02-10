import { Terminal, Shield, Activity, Database, Cpu } from "lucide-react";

export default function AdminPage() {
    const logs = [
        { time: "22:45:12", event: "Gemini cleaned dataset...", status: "success" },
        { time: "22:40:05", event: "Sentiment analyzed: Positive", status: "info" },
        { time: "22:35:18", event: "New track mapped from Nebula Core", status: "success" },
        { time: "22:30:00", event: "Hybrid search sync: 10 tracks indexed", status: "info" },
        { time: "22:25:44", event: "API Gateway: Pulse OK", status: "success" },
        { time: "22:20:12", event: "Sentiment analyzed: Negative", status: "warning" },
    ];

    return (
        <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
                <div className="p-3 rounded-2xl bg-cosmic-accent/20 text-cosmic-accent">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black">Mission Control</h1>
                    <p className="text-text-muted">Panel de administración técnica</p>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: "Uso AI", value: "84%", icon: Cpu },
                    { label: "Tráfico", value: "1.2k", icon: Activity },
                    { label: "Base Datos", value: "Stable", icon: Database },
                    { label: "Status", value: "Online", icon: Shield },
                ].map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-2xl flex items-center gap-4">
                        <stat.icon className="text-cosmic-accent" size={24} />
                        <div>
                            <p className="text-xs text-text-muted font-bold uppercase">{stat.label}</p>
                            <p className="text-xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass rounded-3xl overflow-hidden">
                <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center gap-2">
                    <Terminal size={18} className="text-text-muted" />
                    <span className="text-sm font-bold uppercase tracking-wider">System Logs</span>
                </div>
                <div className="p-6 font-mono text-xs space-y-3">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="text-text-muted">[{log.time}]</span>
                            <span className={
                                log.status === "success" ? "text-green-400" :
                                    log.status === "warning" ? "text-red-400" :
                                        "text-blue-400"
                            }>
                                {log.event}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
