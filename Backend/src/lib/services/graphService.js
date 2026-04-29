import prisma from '../prisma.js';

// Nettoyage des chaînes (enlève accents et majuscules)
const cleanString = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

export const getStats = async (filters) => {
  const { departement, commune, typeMutation, anneeDebut, anneeFin } = filters;
  const startYear = parseInt(anneeDebut) || 2020;
  const endYear = parseInt(anneeFin) || 2024;
  
  // Construction du filtre de localisation (commun aux deux tables)
  const locationWhere = {};
  if (commune) {
    const communeClean = commune.startsWith('0') ? commune.substring(1) : commune;
    locationWhere.code_postal = { in: [commune, communeClean] };
  } else if (departement) {
    const depClean = departement.startsWith('0') ? departement.substring(1) : departement;
    locationWhere.OR = [
      { code_postal: { startsWith: departement } },
      { code_postal: { startsWith: depClean } }
    ];
  }

  // Filtre spécifique pour les transactions
  const transactionWhere = { ...locationWhere, annee: { gte: startYear, lte: endYear } };
  if (typeMutation) {
    transactionWhere.type_transaction = { equals: typeMutation, mode: 'insensitive' };
  }

  try {
    // Récupération des transactions
    const allTransactions = await prisma.transaction.findMany({ 
      where: transactionWhere,
      orderBy: { annee: 'asc' }
    });

    // On garde filteredTransactions égal à allTransactions car le type est déjà filtré par Prisma
    const filteredTransactions = allTransactions;

    // Calcul de l'évolution (prix moyen et volume de ventes)
    const evolutionMap = filteredTransactions.reduce((acc, curr) => {
      const a = curr.annee;
      const p = curr.valeur_fonciere ? parseFloat(curr.valeur_fonciere.toString()) : 0;
      const nbMutations = Number(curr.nombre_mutation || 0);

      if (!acc[a]) acc[a] = { totalPrix: 0, totalMutations: 0, nombreLignes: 0 };
      
      acc[a].totalPrix += p;
      acc[a].totalMutations += nbMutations;
      acc[a].nombreLignes += 1;
      return acc;
    }, {});

    const evolution = Object.keys(evolutionMap)
      .map(a => ({
        annee: parseInt(a),
        prixMoyen: Math.round(evolutionMap[a].totalPrix / (evolutionMap[a].nombreLignes || 1)),
        nbVentes: evolutionMap[a].totalMutations 
      }))
      .sort((a, b) => a.annee - b.annee);

    // Répartition par type de transaction (Vente, Vefa, etc.)
    const totalGlobalMutations = allTransactions.reduce((sum, curr) => sum + Number(curr.nombre_mutation || 0), 0);

    const distributionMap = allTransactions.reduce((acc, curr) => {
      const t = curr.type_transaction || 'Vente';
      const nbMutations = Number(curr.nombre_mutation || 0);
      acc[t] = (acc[t] || 0) + nbMutations;
      return acc;
    }, {});

    const distribution = Object.keys(distributionMap).map(name => ({
      name,
      count: distributionMap[name],
      value: totalGlobalMutations > 0 ? Math.round((distributionMap[name] / totalGlobalMutations) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // Récupération des données démographiques
    const popData = await prisma.population.findFirst({ where: locationWhere });
    let ages = [];
    if (popData) {
      const total = Number(popData.population_totale || 1);
      ages = [
        { label: 'Hommes', value: Math.round((Number(popData.nombre_homme || 0)/total)*100), color: '#3B82F6' },
        { label: 'Femmes', value: Math.round((Number(popData.nombre_femme || 0)/total)*100), color: '#EC4899' },
        { label: 'Enfants', value: Math.round((Number(popData.nombre_enfant || 0)/total)*100), color: '#10B981' },
        { label: 'Jeunes', value: Math.round((Number(popData.nombre_jeune_adulte || 0)/total)*100), color: '#F59E0B' },
        { label: 'Seniors', value: Math.round((Number(popData.nombre_senior_retraite || 0)/total)*100), color: '#6366F1' }
      ];
    }

    return { evolution, distribution, ages };

  } catch (error) {
    console.error("ERREUR PRISMA:", error);
    return { evolution: [], distribution: [], ages: [] };
  }
};