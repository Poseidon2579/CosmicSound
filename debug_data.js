
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Manually parse .env.local to be absolutely sure
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.log("Could not load .env.local directly, trying standard dotenv config");
    dotenv.config({ path: '.env.local' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl ? "Found" : "Missing");
console.log("Key:", supabaseKey ? "Found" : "Missing");

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
    console.log("Fetching sample data...");

    const { data, error } = await supabase
        .from('canciones_con_rating')
        .select('genero, decada')
        .limit(50);

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    console.log(`Fetched ${data.length} rows.`);

    const genres = new Set();
    const decades = new Set();

    data.forEach(row => {
        // Inspect raw type
        if (typeof row.genero === 'string') {
            genres.add(`"${row.genero}"`);
        } else if (Array.isArray(row.genero)) {
            genres.add(`[${row.genero.join(', ')}]`);
        } else {
            genres.add(`${typeof row.genero}: ${JSON.stringify(row.genero)}`);
        }

        if (typeof row.decada === 'string') {
            decades.add(`"${row.decada}"`);
        } else if (Array.isArray(row.decada)) {
            decades.add(`[${row.decada.join(', ')}]`);
        } else {
            decades.add(`${typeof row.decada}: ${JSON.stringify(row.decada)}`);
        }
    });

    console.log("\nUnique Genres (Raw Formats):");
    console.log(Array.from(genres));
    console.log("\nUnique Decades (Raw Formats):");
    console.log(Array.from(decades));
}

inspectData();
