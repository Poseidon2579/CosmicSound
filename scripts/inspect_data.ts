
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
        .limit(20);

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    console.log("Sample Data (First 20 rows):");
    console.table(data);

    // Check unique values if possible (client side aggregation for this script)
    const allGenres = new Set();
    const allDecades = new Set();

    data?.forEach(row => {
        if (Array.isArray(row.genero)) {
            row.genero.forEach((g: string) => allGenres.add(g));
        } else {
            allGenres.add(row.genero);
        }

        if (Array.isArray(row.decada)) {
            row.decada.forEach((d: string) => allDecades.add(d));
        } else {
            allDecades.add(row.decada);
        }
    });

    console.log("\nUnique Genres Found in Sample:", Array.from(allGenres));
    console.log("Unique Decades Found in Sample:", Array.from(allDecades));
}

inspectData();
