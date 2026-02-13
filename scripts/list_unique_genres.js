
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function listUniqueGenres() {
    const { data, error } = await supabase.from('canciones').select('genero');
    if (error) {
        console.error(error);
    } else {
        const genres = new Set(data.map(d => d.genero));
        console.log("Unique values in 'genero':", Array.from(genres));
    }
}

listUniqueGenres();
