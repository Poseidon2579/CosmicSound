
const key = "AIzaSyA7L-CNnCF79fZS3UGqMgmuXwFz2K-gkDA";

async function run() {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const resp = await fetch(listUrl);
    const data = await resp.json();

    if (!data.models) {
        console.error("No se pudieron listar modelos:", data);
        return;
    }

    for (const m of data.models) {
        if (!m.supportedGenerationMethods.includes("generateContent")) continue;
        console.log(`\n--- Probando ${m.name} ---`);
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/${m.name}:generateContent?key=${key}`;
        try {
            const res = await fetch(genUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "OK" }] }] })
            });
            const result = await res.json();
            if (res.ok) {
                console.log(`✅ EXITO con ${m.name}`);
            } else {
                console.log(`❌ FALLO con ${m.name}: ${res.status} - ${result.error?.message || "Error desconocido"}`);
            }
        } catch (e) {
            console.log(`❌ ERROR con ${m.name}: ${e.message}`);
        }
    }
}

run();
