const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('API running ');
});

// If process.env.PORT will come in when deployed to heroku otherwise we use  5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening to ${PORT}`);
});
