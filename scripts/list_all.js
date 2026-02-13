
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function listAll() {
    // Querying pg_attribute and pg_class to get ALL columns for ALL tables in the 'public' schema
    // We'll use a simple approach: just try to select from likely names found in the RPC or information_schema 
    // But wait, I can just use a raw query if they have a 'get_tables' or similar. 

    // Let's try the direct route: query information_schema.columns via RPC if it exists
    const { data, error } = await supabase.from('canciones').select('*').limit(1);
    console.log("Canciones columns:", Object.keys(data?.[0] || {}));

    const { data: vData } = await supabase.from('canciones_con_rating').select('*').limit(1);
    console.log("View columns:", Object.keys(vData?.[0] || {}));

    // Are there any other tables? Check resenas, favoritos, usuarios
    const tables = ['resenas', 'favoritos', 'usuarios'];
    for (const t of tables) {
        const { data: d } = await supabase.from(t).select('*').limit(1);
        console.log(`${t} columns:`, Object.keys(d?.[0] || {}));
    }
}

listAll();
