
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log("Inspecting columns for 'canciones'...");
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'canciones' });
    // If RPC doesn't exist, we'll try a simple select with limit 0

    if (error) {
        console.log("RPC failed, trying fallback select...");
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('canciones')
            .select('*')
            .limit(1);

        if (fallbackError) {
            console.error("Fallback failed:", fallbackError);
        } else {
            console.log("Columns in 'canciones':", Object.keys(fallbackData[0] || {}));
        }
    } else {
        console.log("Schema info:", data);
    }
}

inspectSchema();
