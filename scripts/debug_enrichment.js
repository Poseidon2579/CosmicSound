const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debug() {
    console.log("🔍 Debugging Enrichment Logic...");

    // 1. Check Genres
    const { data: genres } = await supabase.from('genres').select('*');
    console.log(`\n📋 Loaded ${genres.length} Genres:`);
    console.log(genres.map(g => `${g.id}: ${g.name}`).join('\n'));

    // 2. Pick a song
    const { data: songs } = await supabase.from('canciones').select('*').limit(1);
    const song = songs[0];
    console.log(`\n🎵 Processing Song: "${song.titulo}" by "${song.artista}"`);

    // 3. Call AI
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Identify the musical genre and decade for: "${song.titulo}" by "${song.artista}".
  Return JSON ONLY: {"genre": "ExactNameFromList", "decade": "ExactNameFromList"}.
  Genre List: ${genres.map(g => g.name).join(', ')}`;

    console.log(`\n🤖 Sending Prompt to AI...`);
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log(`\n📄 Raw AI Response:\n${text}`);

        const cleanText = text.replace(/```json|```/g, '').trim();
        const output = JSON.parse(cleanText);
        console.log(`\n🧩 Parsed JSON:`, output);

        // 4. Match Logic
        const genreStart = new Date();
        const foundGenre = genres.find(g => g.name.toLowerCase() === output.genre?.toLowerCase());
        console.log(`\n🔎 Matching Genre "${output.genre}":`, foundGenre ? `✅ Found ID ${foundGenre.id}` : `❌ NOT FOUND`);

        // 5. Attempt Write
        if (foundGenre) {
            console.log(`\n💾 Attempting DB Write (Upsert)...`);
            const { error } = await supabase.from('song_genres').upsert(
                { song_id: song.id, genre_id: foundGenre.id },
                { onConflict: 'song_id, genre_id' }
            );

            if (error) console.error("❌ DB Write Error:", error);
            else console.log("✅ DB Write Success!");
        }

    } catch (e) {
        console.error("\n💥 Error:", e);
    }
}

debug();
