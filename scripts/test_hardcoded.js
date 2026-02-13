
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Hardcoding the key from the screenshot to be 100% sure
const key = "AIzaSyA7L-CNnCF79fZS3UGqMgmuXwFz2K-gkDA";
console.log("Using key:", key);
console.log("Key length:", key.length);

const genAI = new GoogleGenerativeAI(key);

async function testModel(modelName) {
    console.log(`\nTesting with model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hola, responde con la palabra 'OK'");
        console.log(`✅ ${modelName} SUCCESS:`, result.response.text());
        return true;
    } catch (err) {
        console.error(`❌ ${modelName} FAILED:`, err.message);
        return false;
    }
}

async function runTests() {
    await testModel("gemini-1.5-flash");
    await testModel("gemma-2-2b-it");
    await testModel("gemma-2-9b-it");
}

runTests();
