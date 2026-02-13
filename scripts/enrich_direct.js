
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const apiKey = "AIzaSyA7L-CNnCF79fZS3UGqMgmuXwFz2K-gkDA";

async function enrichSongs() {
    console.log("🚀 Starting Enriquecimiento con Fetch Directo...");

    const { data: genres } = await supabase.from('genres').select('id, name');
    const { data: decades } = await supabase.from('decades').select('id, name');

    if (!genres || !decades) {
        console.error("Faltan categorías en la DB.");
        return;
    }

    // Get songs without relationships
    const { data: songs, error } = await supabase
        .from('canciones')
        .select('id, titulo, artista, album')
        .limit(50); // Aumentamos el lote

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Procesando ${songs.length} canciones...`);

    for (const song of songs) {
        try {
            const prompt = `Identify the musical genre and decade of this song:
      Title: ${song.titulo}
      Artist: ${song.artista}
      Album: ${song.album}

      Available Genres: ${genres.map(g => g.name).join(', ')}
      Available Decades: ${decades.map(d => d.name).join(', ')}

      Respond ONLY with a JSON object: {"genre": "Name", "decade": "Name"}.`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
            }

            const textOutput = data.candidates[0].content.parts[0].text;
            const output = JSON.parse(textOutput.replace(/```json|```/g, '').trim());

            const genreId = genres.find(g => g.name.toLowerCase() === output.genre.toLowerCase())?.id;
            const decadeId = decades.find(d => d.name.toLowerCase() === output.decade.toLowerCase())?.id;

            if (genreId) {
                await supabase.from('song_genres').upsert({ song_id: song.id, genre_id: genreId });
            }
            if (decadeId) {
                await supabase.from('song_decades').upsert({ song_id: song.id, decade_id: decadeId });
            }

            console.log(`✅ ${song.titulo} -> ${output.genre}, ${output.decade}`);
        } catch (err) {
            console.error(`❌ Error en ${song.titulo}:`, err.message);
        }
    }

    console.log("\nBatch completado corectamente.");
}

enrichSongs();
