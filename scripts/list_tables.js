
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log("Listing tables...");
    const { data, error } = await supabase.rpc('get_tables'); // Fallback to a query if RPC fails

    if (error) {
        console.log("RPC get_tables failed. Trying information_schema query...");
        // Direct SQL is usually restricted, but sometimes public.tables or similar works if exposed via RPC
        // Let's try to just select from common names
        const tables = ['canciones', 'resenas', 'favoritos', 'usuarios'];
        for (const t of tables) {
            const { data: cols, error: colErr } = await supabase.from(t).select('*').limit(1);
            if (!colErr && cols.length > 0) {
                console.log(`Table '${t}' columns:`, Object.keys(cols[0]));
            }
        }
    } else {
        console.log("Tables:", data);
    }
}

listTables();
