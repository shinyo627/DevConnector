const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

// Connect Database
connectDB();

// Initialize Middlewares
// express.json() middle ware is for parsing body data. Basically we can use req.body on our call
app.use(express.json({ extended: false }));

// Defined routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// process.env.PORT will come in when deployed to heroku otherwise we use  5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening to ${PORT}`);
});
