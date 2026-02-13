
const key = "AIzaSyA7L-CNnCF79fZS3UGqMgmuXwFz2K-gkDA";

async function testUrl(url, note) {
    console.log(`--- Testing ${note} ---`);
    try {
        const response = await fetch(url + `?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "OK" }] }] })
        });
        const data = await response.json();
        if (response.ok) {
            console.log(`✅ SUCCESS ${note}`);
            return true;
        } else {
            console.log(`❌ FAILED ${note}: ${response.status} - ${data.error?.message || JSON.stringify(data)}`);
            return false;
        }
    } catch (err) {
        console.log(`❌ ERROR ${note}: ${err.message}`);
        return false;
    }
}

async function run() {
    await testUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", "v1beta flash");
    await testUrl("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent", "v1 flash");
    await testUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", "v1beta pro");
}

run();
