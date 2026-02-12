import Sidebar from "@/components/Sidebar";
import { getCurrentUserServer as getCurrentUser } from "@/lib/user-service-server";
import Link from "next/link";
import ProfileSettingsForm from "@/components/ProfileSettingsForm";

export default async function SettingsPage() {
    const user = await getCurrentUser();

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-background-dark text-white">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="max-w-4xl mx-auto px-8 py-12 md:px-16 lg:px-24 w-full">
                    {/* Header */}
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-bold tracking-tight mb-2">Núcleo del Sistema</h2>
                            <p className="text-gray-400">Administra tu identidad cósmica y visibilidad en la galaxia.</p>
                        </div>
                        <Link href="/profile" className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all text-sm font-semibold">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Ver Perfil Público
                        </Link>
                    </div>

                    <ProfileSettingsForm user={user} />
                </div>
            </main>
        </div>
    );
}
