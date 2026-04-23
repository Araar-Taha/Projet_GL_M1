// Dans Backend/index.js
import express from 'express';
import cors from 'cors';
import graphRoutes from './src/lib/routes/graphRoutes.js'; 
const app = express();
app.use(cors());
app.use(express.json());

// 2. Vérifie que ces DEUX lignes sont là
app.use('/api/graphs', graphRoutes); // <--- C'EST CETTE LIGNE QUI MANQUE (d'où la 404)

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur sur port ${PORT}`);
});
export default app;