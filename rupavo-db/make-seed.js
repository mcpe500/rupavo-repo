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

const template = `
/**
 * Seed function for ${name}
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
async function seed(supabase) {
    console.log('Running seed: ${name}');
    
    // Your seed logic here
    // const { data, error } = await supabase.from('your_table').insert([ ... ]);
}

module.exports = { seed };
`;

fs.writeFileSync(filepath, template.trim());

console.log(`Created seed file: seeds/${filename}`);
