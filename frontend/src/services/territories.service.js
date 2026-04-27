import api from './api'

export async function getDepartements() {
  const response = await api.get('/territoires/departements')
  return response.data
}

export async function getCommunes(codeDepartement) {
  const response = await api.get(`/territoires/departements/${codeDepartement}/communes`)
  return response.data
}

// Pour obtenir les infos de base d'une commune ou d'un département
export async function getCommuneInfo(code) {
  // On essaye d'abord de voir si c'est un département ou une commune
  const response = await api.get(`/mutations/stats/${code}`)
  return response.data
}