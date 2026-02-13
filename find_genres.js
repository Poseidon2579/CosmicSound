
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findGenres() {
    const knownGenres = ['Pop', 'Rock', 'Reggaeton', 'Hip Hop', 'Electronic', 'Jazz'];
    console.log('Searching for any song with these genres:', knownGenres);

    for (const g of knownGenres) {
        const { data, count, error } = await supabase
            .from('canciones')
            .select('titulo, artista, genero', { count: 'exact' })
            .ilike('genero', `%${g}%`)
            .limit(1);

        if (error) {
            console.error(`Error searching for ${g}:`, error.message);
            continue;
        }

        console.log(`- Genre "${g}": ${count} songs found.`);
        if (data && data.length > 0) {
            console.log(`  Example: "${data[0].titulo}" - Genre in DB: "${data[0].genero}"`);
        }
    }

    console.log('\n--- SAMPLE OF 50 SONGS (TITULO, GENERO) ---');
    const { data: samples } = await supabase.from('canciones').select('titulo, genero').limit(50);
    console.table(samples);
}

findGenres();
