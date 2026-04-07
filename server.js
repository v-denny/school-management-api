require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Test DB connection on startup
    await db.testConnection();
    console.log('✅ Database connected successfully');

    // Run migrations (create table if not exists)
    await db.initSchema();
    console.log('✅ Database schema ready');

    app.listen(PORT, () => {
      console.log(`🚀 School Management API running on port ${PORT}`);
      console.log(`   http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
