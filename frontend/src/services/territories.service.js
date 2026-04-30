import api from './api'

export async function getDepartements() {
  const response = await api.get('/territoires/departements')
  return response.data
}

export async function getCommunes(codeDepartement) {
  const response = await api.get(`/territoires/departements/${codeDepartement}/communes`)
  return response.data
}