import express from 'express';
import { getAllGraphData } from '../controllers/graphController.js';

const router = express.Router();
// Route pour récupérer toutes les données des graphes
router.get('/all', getAllGraphData);

export default router;