
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function seedManual() {
    console.log("--- DEBUG SEED ---");

    const { data: genres } = await supabase.from('genres').select('id, name');
    console.log("Genres found:", genres ? genres.length : 0);
    if (genres) console.log("First genre:", genres[0]);

    const { data: decades } = await supabase.from('decades').select('id, name');
    console.log("Decades found:", decades ? decades.length : 0);

    const { data: songs } = await supabase.from('canciones').select('id, titulo').limit(10);
    console.log("Songs found:", songs ? songs.length : 0);

    if (!genres || genres.length === 0 || !decades || decades.length === 0 || !songs || songs.length === 0) {
        console.error("❌ CRITICAL: Missing base data. Did you run the SQL?");
        return;
    }

    const pop = genres.find(g => g.name.toLowerCase() === 'pop')?.id;
    const rock = genres.find(g => g.name.toLowerCase() === 'rock')?.id;
    const d2020 = decades.find(d => d.name.toLowerCase() === '2020s')?.id;

    console.log("Resolved IDs:", { pop, rock, d2020 });

    if (!pop || !d2020) {
        console.error("❌ Could not resolve category IDs");
        return;
    }

    for (let i = 0; i < Math.min(5, songs.length); i++) {
        const { error } = await supabase.from('song_genres').upsert({ song_id: songs[i].id, genre_id: pop });
        if (error) console.error("Error upserting genre:", error.message);
        await supabase.from('song_decades').upsert({ song_id: songs[i].id, decade_id: d2020 });
    }

    console.log("✅ Finished seed attempt.");
}

seedManual();
