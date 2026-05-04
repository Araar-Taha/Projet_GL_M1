import express from 'express';
import { calculateStats, getCustomStats } from '../services/graph.service.js';

const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    const data = await calculateStats(req.query);
    res.json(data);
  } catch (error) {
    console.error("Erreur Graph API:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get('/custom', async (req, res) => {
  try {
    const data = await getCustomStats(req.query);
    res.json(data);
  } catch (error) {
    console.error("Erreur Graph Custom API:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
