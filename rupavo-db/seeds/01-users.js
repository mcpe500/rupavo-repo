const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD are required for user seeding.');
    process.exit(1);
}

async function seed(supabase) {
    console.log(`Checking if user ${adminEmail} exists...`);

    // List users to check if admin already exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError.message);
        throw listError;
    }

    const existingUser = users.find(u => u.email === adminEmail);

    if (existingUser) {
        console.log(`User ${adminEmail} already exists. ID: ${existingUser.id}`);
        return;
    }

    console.log(`Creating user ${adminEmail}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
    });

    if (error) {
        console.error('Error creating user:', error.message);
        throw error;
    }

    console.log(`User ${adminEmail} created successfully. ID: ${data.user.id}`);
}

module.exports = { seed };
