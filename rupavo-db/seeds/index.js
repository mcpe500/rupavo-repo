require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runSeeds() {
    const seedsDir = __dirname;
    const files = fs.readdirSync(seedsDir).filter(file => file.endsWith('.js') && file !== 'index.js');

    // Sort files to ensure order (e.g. 01-users.js, 02-posts.js)
    files.sort();

    console.log(`Found ${files.length} seed scripts.`);

    for (const file of files) {
        console.log(`\n--- Running seed: ${file} ---`);
        const seedScript = require(path.join(seedsDir, file));

        if (typeof seedScript === 'function') {
            await seedScript(supabase);
        } else if (typeof seedScript.seed === 'function') {
            await seedScript.seed(supabase);
        } else {
            // Handle case where script runs on require or exports nothing useful
            // For now, we assume the moved script might need adjustment to export a function
            // or we just let it run if it's self-executing (but self-executing is bad for a runner)
            console.log(`Skipping ${file}: No export found. Ensure it exports a function.`);
        }
    }

    console.log('\nAll seeds completed.');
}

runSeeds().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
