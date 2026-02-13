const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// CONFIGURATION
const BATCH_SIZE = 15; // Process 15 songs in parallel chunks
const CONCURRENCY = 3; // Run 3 batches at once (45 songs total in flight)
const MODEL_NAME = "gemini-2.5-flash"; // Fast & Efficient

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

async function enrichBatch(songs, genres, decades) {
    const promises = songs.map(async (song) => {
        try {
            const prompt = `Identify the musical genre and decade for: "${song.titulo}" by "${song.artista}".
      Return JSON ONLY: {"genre": "ExactNameFromList", "decade": "ExactNameFromList"}.
      Genre List: ${genres.map(g => g.name).join(', ')}
      Decade List: ${decades.map(d => d.name).join(', ')}`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/g, '').trim();
            const output = JSON.parse(text);

            const genreId = genres.find(g => g.name.toLowerCase() === output.genre?.toLowerCase())?.id;
            const decadeId = decades.find(d => d.name.toLowerCase() === output.decade?.toLowerCase())?.id;

            const updates = [];
            if (genreId) updates.push(supabase.from('song_genres').upsert({ song_id: song.id, genre_id: genreId }, { onConflict: 'song_id, genre_id' }));
            if (decadeId) updates.push(supabase.from('song_decades').upsert({ song_id: song.id, decade_id: decadeId }, { onConflict: 'song_id, decade_id' }));

            await Promise.all(updates);
            process.stdout.write('.'); // Progress dot
            return true;
        } catch (err) {
            // console.error(`Error on ${song.titulo}: ${err.message}`);
            process.stdout.write('x'); // Error x
            return false;
        }
    });

    return Promise.all(promises);
}

async function runTurbo() {
    console.log(`🚀 Starting TURBO Enrichment (${MODEL_NAME})`);

    // 1. Load Catalogs
    const { data: genres } = await supabase.from('genres').select('id, name');
    const { data: decades } = await supabase.from('decades').select('id, name');

    // 2. Get untagged songs (anti-join logic manually or just get all and skip existing locally if DB is small, 
    // but for 20k better to use SQL filter if possible. For now, let's grab random 1000 not in song_genres)
    // Converting to a simple "not in" query is hard without exact SQL, so we'll fetch a chunk and filter.

    let totalProcessed = 0;
    const LIMIT = 500; // Process 500 in this run

    console.log("Fetching songs...");

    // First, get IDs already done to exclude them (inefficient for huge DBs but fine for <50k for a script)
    const { data: doneGenres } = await supabase.from('song_genres').select('song_id');
    const doneSet = new Set(doneGenres.map(d => d.song_id));

    const { data: allSongs } = await supabase
        .from('canciones')
        .select('id, titulo, artista, album')
        .order('vistas', { ascending: false }) // Prioritize popular songs
        .limit(3000);

    const pendingSongs = allSongs.filter(s => !doneSet.has(s.id));

    console.log(`Found ${pendingSongs.length} pending songs to process.`);

    // Chunk loop
    for (let i = 0; i < pendingSongs.length && totalProcessed < LIMIT; i += (BATCH_SIZE * CONCURRENCY)) {
        const chunk = pendingSongs.slice(i, i + (BATCH_SIZE * CONCURRENCY));

        // Split chunk into sub-batches
        const batches = [];
        for (let j = 0; j < chunk.length; j += BATCH_SIZE) {
            batches.push(chunk.slice(j, j + BATCH_SIZE));
        }

        console.log(`\nProcessing batch ${i} - ${i + chunk.length}...`);
        await Promise.all(batches.map(b => enrichBatch(b, genres, decades)));
        totalProcessed += chunk.length;
    }

    console.log("\n✅ Turbo Batch Complete.");
}

runTurbo();
