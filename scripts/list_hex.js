
const key = "AIzaSyA7L-CNnCF79fZS3UGqMgmuXwFz2K-gkDA";

async function listModelsHex() {
    console.log("Listing models and inspecting hex...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            data.models.forEach(m => {
                const hex = Buffer.from(m.name).toString('hex');
                console.log(`Name: ${m.name} | Hex: ${hex}`);
                if (m.name.includes("gemini-1.5-flash")) {
                    console.log("Found Flash!");
                }
            });
        } else {
            console.error("FAILED:", response.status, data);
        }
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

listModelsHex();
