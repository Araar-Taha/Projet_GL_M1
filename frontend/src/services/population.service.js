import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export const getPopulationStatsByDept = async () => {
  const response = await axios.get(`${API_URL}/population/stats-by-dept`)
  return response.data
}

export const getPopulationStatsByCommune = async (deptCode) => {
  const response = await axios.get(`${API_URL}/population/stats-by-commune/${deptCode}`)
  return response.data
}

export const getPopulationEvolution = async (code) => {
  const response = await axios.get(`${API_URL}/population/evolution/${code}`)
  return response.data
}
