const api = require('./src/api');

const PORT = process.env.PORT || 5000;

api.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
