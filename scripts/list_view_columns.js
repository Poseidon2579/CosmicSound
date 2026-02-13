
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listColumns() {
    console.log("Listing columns for 'canciones_con_rating'...");
    const { data, error } = await supabase
        .from('canciones_con_rating')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Select failed:", error);
    } else {
        if (data && data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("No data found in view.");
        }
    }
}

listColumns();
