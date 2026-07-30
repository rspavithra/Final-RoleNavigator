const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const uri = process.env.MONGO_URI;
const normalizedUri = uri.replace(/\/RoleNavigator(\?|$)/i, '/rolenavigator$1');
console.log('URI:', normalizedUri);

const userSchema = new mongoose.Schema({ name: String, email: String, password: String });
const User = mongoose.model('CheckUser', userSchema);

mongoose.connect(normalizedUri, { dbName: 'rolenavigator' })
  .then(async () => {
    console.log('connected to', mongoose.connection.name);
    const u = new User({ name: 'Debug User', email: 'debug@example.com', password: 'abc123' });
    await u.save();
    console.log('saved user');
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('error', err.name, err.message);
    console.error(err.stack);
    process.exit(1);
  });
