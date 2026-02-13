const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function diagnose() {
    console.log("🔍 Diagnosing Genres Table...");

    // 1. Try to get schema info (if generic query works, strict RLS might block system tables)
    // RPC is safer usually if exists, but we'll try a raw insert first.

    const testId = randomUUID();
    const testName = `TestGenre-${Date.now()}`;

    console.log(`\n🧪 Attempting to insert: { id: '${testId}', name: '${testName}' }`);

    const { data, error } = await supabase.from('genres').insert({
        id: testId,
        name: testName
    }).select();

    if (error) {
        console.error("\n❌ INSERT ERROR FULL OBJECT:");
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log("\n✅ Insert Success!", data);
        // Cleanup
        await supabase.from('genres').delete().eq('id', testId);
    }

    // 2. List current genres
    const { data: list } = await supabase.from('genres').select('*');
    console.log("\n📋 Current Genres in DB:", list);
}

diagnose();
