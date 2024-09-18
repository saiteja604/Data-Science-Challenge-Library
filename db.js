const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/AI_DATABASE';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

module.exports = mongoose;
