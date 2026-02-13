
const key = "AIzaSyA7L-CNnCF79fZS3UGqMgmuXwFz2K-gkDA";

async function testRawFetch() {
    console.log("Testing Gemini API with raw fetch...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const body = {
        contents: [{ parts: [{ text: "Hola, responde OK" }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (response.ok) {
            console.log("✅ RAW FETCH SUCCESS:", JSON.stringify(data.candidates[0].content.parts[0].text));
        } else {
            console.error("❌ RAW FETCH FAILED:", response.status, JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("❌ FETCH ERROR:", err.message);
    }
}

testRawFetch();
