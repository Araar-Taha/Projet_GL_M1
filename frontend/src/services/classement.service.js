import api from './api'

export async function getClassement({ scale, metrique }) {
  const response = await api.get('/classement', { params: { scale, metrique } })
  return response.data
}
