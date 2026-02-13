
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function getViewDef() {
    console.log("Fetching view definition...");
    // Try to use a common RPC if available, or a direct query if the user has an 'exec_sql' function
    // Since I don't know the RPCs, I'll try to use the most likely one or a manual inspection.

    // FALLBACK: Just select a row and look at ALL keys again, maybe I missed something.
    const { data, error } = await supabase.from('canciones_con_rating').select('*').limit(1);
    if (error) {
        console.error(error);
    } else {
        console.log("Full row keys:", Object.keys(data[0]));
    }
}

getViewDef();
