// test-env.js
require('dotenv').config();

console.log('Testing .env file loading...');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('\nAll env vars:', Object.keys(process.env).filter(key => 
  ['PORT', 'DATABASE_URL', 'NODE_ENV', 'JWT_SECRET', 'ENCRYPTION_KEY'].includes(key)
));