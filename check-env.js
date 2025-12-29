require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Loaded' : 'Missing');
