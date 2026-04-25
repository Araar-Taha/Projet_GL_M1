import api from './api'
import { getStoredToken } from './auth.service'

export async function createTransaction(transactionData) {
    const token = getStoredToken()
    const response = await api.post('/transactions', transactionData, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}
