const mongoose = require('mongoose');
const Room = require('./backend/src/models/Room.js').default;
const User = require('./backend/src/models/User.js').default;

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://mustafatoptss:1234@cluster0.eovto.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(async () => {
  const rooms = await Room.find().populate('hostId', 'username email');
  console.log('Total rooms:', rooms.length);
  rooms.forEach(r => {
    console.log(r.name, '| Host:', r.hostId ? r.hostId.username : 'Unknown', '| Status:', r.status);
  });
  process.exit(0);
});
