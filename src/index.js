import express from 'express';
import matchRouter from './routes/matchRouter.js';

const app = express();
const PORT = 8000;

// Use JSON middleware
app.use(express.json());

// Root GET route
app.get('/', (req, res) => {
  res.send('Hello, this is a simple Express server!');
});

app.use('/matches', matchRouter);
// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});