
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function enrichSongs() {
    console.log("🚀 Starting AI Enrichment...");

    // 1. Get available categories to match against
    const { data: genres } = await supabase.from('genres').select('id, name');
    const { data: decades } = await supabase.from('decades').select('id, name');

    if (!genres || !decades) {
        console.error("Missing catalogs in DB. Run SQL first.");
        return;
    }

    // 2. Get songs that don't have relationships yet (sampling top 20 to demonstrate)
    const { data: songs, error } = await supabase
        .from('canciones')
        .select('id, titulo, artista, album')
        .limit(30);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Processing ${songs.length} songs...`);

    for (const song of songs) {
        try {
            const prompt = `Identify the musical genre and decade of this song:
      Title: ${song.titulo}
      Artist: ${song.artista}
      Album: ${song.album}

      Available Genres: ${genres.map(g => g.name).join(', ')}
      Available Decades: ${decades.map(d => d.name).join(', ')}

      Respond ONLY with a JSON object: {"genre": "Name", "decade": "Name"}. If unsure, pick the best match.`;

            const result = await model.generateContent(prompt);
            const output = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

            const genreId = genres.find(g => g.name.toLowerCase() === output.genre.toLowerCase())?.id;
            const decadeId = decades.find(d => d.name.toLowerCase() === output.decade.toLowerCase())?.id;

            if (genreId) {
                await supabase.from('song_genres').upsert({ song_id: song.id, genre_id: genreId });
            }
            if (decadeId) {
                await supabase.from('song_decades').upsert({ song_id: song.id, decade_id: decadeId });
            }

            console.log(`✅ Tagged: ${song.titulo} -> ${output.genre}, ${output.decade}`);
        } catch (err) {
            console.error(`❌ Error tagging ${song.titulo}:`, err.message);
        }
    }

    console.log("\n🎉 Enrichment batch complete! Refresh your app.");
}

enrichSongs();
