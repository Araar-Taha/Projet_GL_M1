// Helper pour filtrer une table par code postal selon que c'est un département (<=3 chiffres) ou une commune
export function whereCodePostal(code) {
  if (!code) return {};
  
  // Cas particuliers des villes à arrondissements (Paris, Lyon, Marseille)
  // On matche à la fois le code ville (pour la population) et les codes arrondissements (pour les transactions)
  if (code === '75056') return { OR: [{ code_postal: '75056' }, { code_postal: { startsWith: '75' } }] }; // Paris
  if (code === '69123') return { OR: [{ code_postal: '69123' }, { code_postal: { startsWith: '6938' } }] }; // Lyon
  if (code === '13055') return { OR: [{ code_postal: '13055' }, { code_postal: { startsWith: '132' } }] }; // Marseille

  return code.length <= 3
    ? { code_postal: { startsWith: code } }
    : { code_postal: code };
}
