
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function verifyCounts() {
    const { count: genreCount, error: gErr } = await supabase
        .from('song_genres')
        .select('*', { count: 'exact', head: true });

    const { count: decadeCount, error: dErr } = await supabase
        .from('song_decades')
        .select('*', { count: 'exact', head: true });

    if (gErr || dErr) {
        console.error("Error:", gErr || dErr);
    } else {
        console.log(`✅ Relationships found:`);
        console.log(`- song_genres: ${genreCount}`);
        console.log(`- song_decades: ${decadeCount}`);
    }
}

verifyCounts();
