
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function getAllTables() {
    console.log("Listing tables in schema 'public'...");
    // Note: Standard Supabase JS can't query information_schema directly unless it's explicitly exposed in an API/view.
    // But we can try to use RPCs if the user has any.
    // Or just try to see if there are any other common names.

    const { data, error } = await supabase.from('canciones').select('*').limit(1);
    if (data) console.log("Found: canciones");

    // Try common table names
    const potential = ['songs', 'tracks', 'metadata', 'ratings', 'playlist', 'album', 'genre', 'genres', 'decades'];
    for (const p of potential) {
        const { data: d, error: e } = await supabase.from(p).select('*').limit(1);
        if (!e) console.log(`Found: ${p}`);
    }
}

getAllTables();
