
const key = "AIzaSyA7L-CNnCF79fZS3UGqMgmuXwFz2K-gkDA";

async function checkModel(modelName) {
    console.log(`Checking model info: ${modelName}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            console.log(`✅ ${modelName} INFO:`, JSON.stringify(data, null, 2));
        } else {
            console.error(`❌ ${modelName} GET FAILED:`, response.status, JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error(`❌ ERROR ${modelName}:`, err.message);
    }
}

async function run() {
    await checkModel("gemini-1.5-flash");
}

run();
