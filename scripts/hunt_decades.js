
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function findDecadeData() {
    console.log("Searching for decade-like strings in 'canciones_con_rating'...");
    const { data, error } = await supabase.from('canciones_con_rating').select('*').limit(50);

    if (error) {
        console.error(error);
    } else {
        data.forEach((row, i) => {
            const rowStr = JSON.stringify(row);
            if (rowStr.match(/\d{4}s?|decade|80|90|20\d{2}/i)) {
                console.log(`Row ${i} contains potential decade data:`);
                console.log(rowStr);
            }
        });
    }
}

findDecadeData();
