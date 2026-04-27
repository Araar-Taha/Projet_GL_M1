import * as graphService from '../services/graphService.js';

export const getAllGraphData = async (req, res) => {
  try {
    // Passage des filtres (query) au service
    const data = await graphService.getStats(req.query);
    res.json(data);
  } catch (error) {
    console.error("Erreur GraphController:", error);
    // Retour erreur 500 pour le front
    res.status(500).json({ error: "Erreur serveur" });
  }
};