import express from 'express';

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.send('Welcome to the server');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
