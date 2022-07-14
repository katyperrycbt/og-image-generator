import express from 'express';
import cors from 'cors';
import routes from './api/index.js';

const PORT = process.env.PORT || 8000;
const app = express();

app.use(cors());

app.use(express.json({ limit: "150mb" }));

app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});