
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function sampleDecades() {
    console.log("Sampling 'decada' from 'canciones_con_rating'...");
    const { data, error } = await supabase
        .from('canciones_con_rating')
        .select('id, decada')
        .limit(10);

    if (error) {
        console.error("Select failed:", error);
    } else {
        console.log("Samples:", data);
    }
}

sampleDecades();
