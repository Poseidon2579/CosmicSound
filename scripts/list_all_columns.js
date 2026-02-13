
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllColumns() {
    console.log("--- TABLE: canciones ---");
    const { data: tData, error: tErr } = await supabase.from('canciones').select('*').limit(1);
    if (tErr) console.error("Error canciones:", tErr);
    else if (tData.length > 0) console.log(Object.keys(tData[0]));
    else console.log("No data");

    console.log("\n--- VIEW: canciones_con_rating ---");
    const { data: vData, error: vErr } = await supabase.from('canciones_con_rating').select('*').limit(1);
    if (vErr) console.error("Error view:", vErr);
    else if (vData.length > 0) console.log(Object.keys(vData[0]));
    else console.log("No data");
}

listAllColumns();
