const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const name = args[0];

if (!name) {
    console.error('Please provide a seed name. Usage: node make-seed.js <name>');
    process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
const filename = `${timestamp}_${name}.js`;
const filepath = path.join(__dirname, 'seeds', filename);

const template = `/**
 * Seed: ${name}
 * Created: ${new Date().toISOString()}
 * 
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
async function seed(supabase) {
    console.log('Running seed: ${name}');
    
    // Example: Insert data
    // const { data, error } = await supabase
    //     .from('your_table')
    //     .insert([
    //         { name: 'Item 1', value: 100 },
    //         { name: 'Item 2', value: 200 },
    //     ]);
    
    // Example: Upsert (insert or update)
    // const { error } = await supabase
    //     .from('your_table')
    //     .upsert(items, { onConflict: 'id' });
    
    // Always throw errors to stop the runner
    // if (error) throw error;
    
    // console.log('Seed completed: ${name}');
}

module.exports = { seed };
`;

fs.writeFileSync(filepath, template.trim());

console.log(`Created seed file: seeds/${filename}`);
