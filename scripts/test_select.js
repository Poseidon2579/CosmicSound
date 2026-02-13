
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testQuery() {
    console.log("Testing: SELECT genero, decada FROM canciones_con_rating LIMIT 1");
    const { data, error } = await supabase.from('canciones_con_rating').select('genero, decada').limit(1);
    if (error) {
        console.error("FAILED:", error.message);
    } else {
        console.log("SUCCESS:", data[0]);
    }
}

testQuery();
