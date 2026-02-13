
const key = "AIzaSyA7L-CNnCF79fZS3UGqMgmuXwFz2K-gkDA";

async function testGemma3() {
    const modelName = "gemma-3-nano-2026";
    console.log(`Testing with specific model requested: ${modelName}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hola" }] }] })
        });
        const data = await response.json();
        if (response.ok) {
            console.log(`✅ SUCCESS WITH ${modelName}`);
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log(`❌ FAILED ${modelName}: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
        }
    } catch (err) {
        console.log(`❌ ERROR ${modelName}: ${err.message}`);
    }
}

testGemma3();
