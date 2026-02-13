
const key = "AIzaSyA7L-CNnCF79fZS3UGqMgmuXwFz2K-gkDA";

async function listModels() {
    console.log("Listing available models for the key...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            console.log("✅ MODELS FOUND:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.error("❌ LIST MODELS FAILED:", response.status, JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("❌ FETCH ERROR:", err.message);
    }
}

listModels();
