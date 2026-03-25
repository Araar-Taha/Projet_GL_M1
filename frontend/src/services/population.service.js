import api from './api'

export async function getPopulationEvolution(codeTerritoire) {
  const response = await api.get(`/population/evolution/${codeTerritoire}`)
  return response.data
}

export async function getAgeDistribution(codeTerritoire) {
  const response = await api.get(`/population/ages/${codeTerritoire}`)
  return response.data
}
