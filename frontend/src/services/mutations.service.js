import api from './api'

export async function getMutations(filters) {
  const response = await api.get('/mutations', { params: filters })
  return response.data
}

export async function getMutationsStats(codeTerritoire, filters = {}) {
  const response = await api.get(`/mutations/stats/${codeTerritoire}`, { params: filters })
  return response.data
}

export async function getPrixEvolution(codeTerritoire, typeMutation) {
  const response = await api.get(`/mutations/prix-evolution/${codeTerritoire}`, {
    params: { typeMutation }
  })
  return response.data
}


export async function getStatsByDept(filters = {}) {
  const response = await api.get('/mutations/stats-by-dept', { params: filters })
  return response.data
}

export async function getStatsByCommune(deptCode, filters = {}) {
  const response = await api.get(`/mutations/stats-by-commune/${deptCode}`, { params: filters })
  return response.data
}

export async function createTransaction(transactionData) {
  const response = await api.post('/mutations', transactionData)
  return response.data
}

