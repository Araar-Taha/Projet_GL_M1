// Helper pour filtrer une table par code postal selon que c'est un département (<=3 chiffres) ou une commune
export function whereCodePostal(code) {
  return code.length <= 3
    ? { code_postal: { startsWith: code } }
    : { code_postal: code };
}
