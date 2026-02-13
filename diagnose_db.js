
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- TOP 20 GENRES IN DB ---');
    const { data: genres, error: gError } = await supabase
        .from('canciones')
        .select('genero');

    if (gError) {
        console.error(gError);
        return;
    }

    const genreCounts = {};
    genres.forEach(g => {
        const val = g.genero || 'NULL';
        genreCounts[val] = (genreCounts[val] || 0) + 1;
    });

    console.log(genreCounts);

    const check = 'Rock';
    console.log(`\n--- CHECKING PARTIAL MATCH FOR "${check}" ---`);
    const { data: matches, error: mError } = await supabase
        .from('canciones')
        .select('titulo, artista, genero')
        .ilike('genero', `%${check}%`)
        .limit(5);

    console.table(matches);
}

diagnose();
