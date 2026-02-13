
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const rawKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const key = rawKey.trim();
console.log("Using key starting with:", key ? key.substring(0, 5) + "..." : "MISSING");
console.log("Key length:", key.length);

const genAI = new GoogleGenerativeAI(key);

async function testModel(modelName) {
    console.log(`\nTesting with model: ${modelName}...`);
    try {
        const testModel = genAI.getGenerativeModel({ model: modelName });
        const result = await testModel.generateContent("Hola, responde con la palabra 'OK'");
        console.log(`✅ ${modelName} SUCCESS:`, result.response.text());
        return true;
    } catch (err) {
        console.error(`❌ ${modelName} FAILED:`);
        console.error("Message:", err.message);
        return false;
    }
}

async function runTests() {
    await testModel("gemini-1.5-flash-8b");
    await testModel("gemini-1.5-flash");
    await testModel("gemini-2.0-flash-exp");
}

runTests();
