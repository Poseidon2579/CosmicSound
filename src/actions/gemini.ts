"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analyzeSentiment(text: string) {
  try {
    const prompt = `Analiza el sentimiento de la siguiente reseña musical y responde únicamente con una palabra: "Positivo", "Neutro" o "Negativo".\n\nReseña: "${text}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "Neutro";
  }
}

export async function discoverMusic(query: string) {
  try {
    const prompt = `Basándote en la búsqueda "${query}", recomienda 3 canciones relacionadas. Responde en formato JSON: [{"title": "...", "artist": "..."}]`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error discovering music:", error);
    return [];
  }
}
