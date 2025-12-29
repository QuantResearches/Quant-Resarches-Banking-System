require('dotenv').config();
console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL ? 'Loaded' : 'Missing');
console.log('POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING ? 'Loaded' : 'Missing');
