const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cmfldmmrlpoytmhjbxdw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initDatabase() {
  console.log('Initializing Supabase database...');

  // Note: supabase-js does not have a direct 'create table' method for security reasons.
  // Usually, this is done via the Dashboard or SQL migrations.
  // However, we can use the RPC call if there's a custom function, or attempt to use the management API.
  // Given the constraints, I will attempt to perform a simple query to check if tables exist,
  // and if not, I'll inform that manual SQL execution might be needed if I can't find a way to run SQL.
  
  // Checking for 'users' table
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (usersError) {
    if (usersError.code === '42P01') {
      console.log('Table "users" does not exist. (Code 42P01)');
      // In a real migration script, we'd run SQL here.
    } else {
      console.error('Error checking "users" table:', usersError.message);
    }
  } else {
    console.log('Table "users" already exists.');
  }

  // Checking for 'itineraries' table
  const { data: itinerariesData, error: itinerariesError } = await supabase
    .from('itineraries')
    .select('*')
    .limit(1);

  if (itinerariesError) {
    if (itinerariesError.code === '42P01') {
      console.log('Table "itineraries" does not exist. (Code 42P01)');
    } else {
      console.error('Error checking "itineraries" table:', itinerariesError.message);
    }
  } else {
    console.log('Table "itineraries" already exists.');
  }
  
  console.log('Database initialization check complete.');
}

initDatabase();
