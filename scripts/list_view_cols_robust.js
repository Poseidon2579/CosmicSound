
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function listCols() {
    const { data, error } = await supabase.from('canciones_con_rating').select('*').limit(1);
    if (error) {
        console.error(error);
    } else if (data.length > 0) {
        console.log("COLUMNS IN 'canciones_con_rating':");
        Object.keys(data[0]).forEach(k => console.log("- " + k));
    } else {
        console.log("No data in 'canciones_con_rating'");
    }
}

listCols();
