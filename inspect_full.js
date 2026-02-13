
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectFull() {
    const { data: songs, error } = await supabase
        .from('canciones')
        .select('*')
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    songs.forEach((s, i) => {
        console.log(`Song ${i + 1}: "${s.titulo}" by "${s.artista}"`);
        console.log('   All fields:', JSON.stringify(s, null, 2));
    });
}

inspectFull();
