
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env.local (one level up from scripts/)
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
    console.log("Fetching sample data from 'canciones_con_rating'...");

    const { data, error } = await supabase
        .from('canciones_con_rating')
        .select('id, titulo, genero, decada')
        .limit(20);

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    console.log(`Retrieved ${data.length} rows.`);
    console.log("---------------------------------------------------");
    data.forEach((row, i) => {
        console.log(`Row ${i + 1}:`);
        console.log(`  Title: ${row.titulo}`);
        console.log(`  Genero (${typeof row.genero}):`, row.genero);
        console.log(`  Decada (${typeof row.decada}):`, row.decada);
        console.log("---------------------------------------------------");
    });
}

inspectData();
