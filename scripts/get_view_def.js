
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getViewDef() {
    console.log("Getting definition for 'canciones_con_rating'...");
    const { data, error } = await supabase.rpc('get_view_definition', { view_name: 'canciones_con_rating' });

    if (error) {
        console.log("RPC get_view_definition failed. Trying information_schema...");
        const { data: infoData, error: infoError } = await supabase
            .from('pg_views') // This might not be accessible via Supabase JS directly if not exposed
            .select('definition')
            .eq('viewname', 'canciones_con_rating');

        if (infoError) {
            console.log("Fallback to direct query if possible (likely restricted).");
            // Try to just select one row from the view to see what it has
            const { data: sample, error: sampleError } = await supabase
                .from('canciones_con_rating')
                .select('*')
                .limit(1);
            if (sampleError) console.error("Sample failed:", sampleError);
            else console.log("Columns in view:", Object.keys(sample[0]));
        } else {
            console.log("View definition:", infoData[0]?.definition);
        }
    } else {
        console.log("View definition:", data);
    }
}

getViewDef();
