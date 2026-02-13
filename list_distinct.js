
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listDistinct() {
    const { data: genres, error: gError } = await supabase
        .from('canciones')
        .select('genero');

    if (gError) console.error(gError);
    else {
        const uniqueGenres = [...new Set(genres.map(g => g.genero))].filter(Boolean);
        console.log('DISTINCT GENRES:', uniqueGenres);
    }

    const { data: decades, error: dError } = await supabase
        .from('canciones')
        .select('decada');

    if (dError) console.error(dError);
    else {
        const uniqueDecades = [...new Set(decades.map(d => d.decada))].filter(Boolean);
        console.log('DISTINCT DECADES:', uniqueDecades);
    }
}

listDistinct();
