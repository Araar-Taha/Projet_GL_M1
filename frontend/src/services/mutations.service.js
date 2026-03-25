import api from './api'

export async function getMutations(filters) {
  const response = await api.get('/mutations', { params: filters })
  return response.data
}

export async function getMutationsStats(codeTerritoire) {
  const response = await api.get(`/mutations/stats/${codeTerritoire}`)
  return response.data
}

export async function getPrixEvolution(codeTerritoire) {
  const response = await api.get(`/mutations/prix-evolution/${codeTerritoire}`)
  return response.data
}
