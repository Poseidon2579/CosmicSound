
const key = "AIzaSyA7L-CNnCF79fZS3UGqMgmuXwFz2K-gkDA";

async function run() {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const resp = await fetch(listUrl);
    const data = await resp.json();

    const working = [];
    for (const m of data.models) {
        if (!m.supportedGenerationMethods.includes("generateContent")) continue;

        const genUrl = `https://generativelanguage.googleapis.com/v1beta/${m.name}:generateContent?key=${key}`;
        try {
            const res = await fetch(genUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
            });
            if (res.ok) {
                working.push(m.name);
            }
        } catch (e) { }
    }

    console.log("WORKING_MODELS_START");
    working.forEach(m => console.log(m));
    console.log("WORKING_MODELS_END");
}

run();
