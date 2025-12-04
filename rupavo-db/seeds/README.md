# Seeds Guide

Folder ini berisi JavaScript seeders untuk mengisi data ke database Supabase.

## 📋 Cara Kerja

1. **File dijalankan berurutan** berdasarkan nama file (01, 02, dst)
2. **Menggunakan `service_role` key** untuk bypass RLS
3. **Setiap file export fungsi `seed(supabase)`**

## 🚀 Quick Start

### Buat Seeder Baru

```bash
npm run db:make:seed create_dummy_products
```

Akan membuat: `seeds/20241204_create_dummy_products.js`

### Jalankan Semua Seeders

```bash
npm run db:seed
```

## 📝 Contoh Seeder

### Basic Insert

```javascript
/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
async function seed(supabase) {
    console.log('Seeding products...');

    const products = [
        { name: 'Product A', price: 10000 },
        { name: 'Product B', price: 20000 },
    ];

    const { data, error } = await supabase
        .from('products')
        .insert(products);

    if (error) throw error;
    console.log(`Inserted ${products.length} products`);
}

module.exports = { seed };
```

### Upsert (Insert or Update)

```javascript
async function seed(supabase) {
    const categories = [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Fashion' },
    ];

    const { error } = await supabase
        .from('categories')
        .upsert(categories, { onConflict: 'id' });

    if (error) throw error;
}

module.exports = { seed };
```

### Check Before Insert

```javascript
async function seed(supabase) {
    // Check if data exists
    const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .limit(1);

    if (existing?.length > 0) {
        console.log('Settings already seeded, skipping...');
        return;
    }

    // Insert data
    await supabase.from('settings').insert([
        { key: 'app_name', value: 'Rupavo' },
    ]);
}

module.exports = { seed };
```

## ⚠️ Important Notes

1. **Seeders bersifat append** - Jalankan sekali saja, atau gunakan upsert
2. **Service role key** - Jangan commit ke git!
3. **Urutan file penting** - Gunakan prefix angka (01, 02, dst)
4. **Error handling** - Throw error agar runner berhenti jika gagal
