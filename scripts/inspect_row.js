
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectRow() {
    const { data, error } = await supabase.from('canciones_con_rating').select('*').limit(1);
    if (error) console.error(error);
    else console.log(JSON.stringify(data[0], null, 2));
}

inspectRow();
