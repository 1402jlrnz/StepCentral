const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI).then(con => {
        console.log(`MongoDB connected: ${con.connection.host}`);
    }).catch(err => {
        console.error('MongoDB connection failed. Check DB_URI in backend/.env');
        console.error(err.message);
    });
};

module.exports = connectDatabase;
