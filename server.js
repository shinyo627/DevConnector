const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

app.get('/', (req, res) => {
  res.send('API running ');
});

// Initialize Middlewares
// express.json() middle ware is for parsing body data. Basically we can use req.body on our call
app.use(express.json({ extended: false }));

// Defined routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// If process.env.PORT will come in when deployed to heroku otherwise we use  5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening to ${PORT}`);
});
