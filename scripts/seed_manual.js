
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function seedManual() {
    console.log("Seeding a few songs manually...");

    const { data: genres } = await supabase.from('genres').select('id, name');
    const { data: decades } = await supabase.from('decades').select('id, name');
    const { data: songs } = await supabase.from('canciones').select('id').limit(10);

    const pop = genres.find(g => g.name === 'Pop')?.id;
    const rock = genres.find(g => g.name === 'Rock')?.id;
    const d2020 = decades.find(d => d.name === '2020s')?.id;
    const d80 = decades.find(d => d.name === '80s')?.id;

    if (!pop || !d2020 || !songs) return;

    // Link first 5 to Pop/2020s
    for (let i = 0; i < 5; i++) {
        await supabase.from('song_genres').upsert({ song_id: songs[i].id, genre_id: pop });
        await supabase.from('song_decades').upsert({ song_id: songs[i].id, decade_id: d2020 });
    }

    // Link next 5 to Rock/80s
    for (let i = 5; i < 10; i++) {
        await supabase.from('song_genres').upsert({ song_id: songs[i].id, genre_id: rock });
        await supabase.from('song_decades').upsert({ song_id: songs[i].id, decade_id: d80 });
    }

    console.log("✅ Seeded 10 songs. Pop should show (5), Rock (5), etc.");
}

seedManual();
