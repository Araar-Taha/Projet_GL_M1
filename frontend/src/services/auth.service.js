import api from './api'

const TOKEN_KEY = 'dvf_auth_token'

export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function removeStoredToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export async function register({ nom, prenom, email, mot_de_pass }) {
    const response = await api.post('/auth/register', { nom, prenom, email, mot_de_pass })
    setStoredToken(response.data.token)
    return response.data
}

export async function login({ email, mot_de_pass }) {
    const response = await api.post('/auth/login', { email, mot_de_pass })
    setStoredToken(response.data.token)
    return response.data
}

export async function getProfile() {
    const token = getStoredToken()
    const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export async function updateProfile({ nom, prenom, email }) {
    const token = getStoredToken()
    const response = await api.put('/auth/me', { nom, prenom, email }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export async function changePassword({ ancien_mot_de_pass, nouveau_mot_de_pass }) {
    const token = getStoredToken()
    const response = await api.put('/auth/me/password', { ancien_mot_de_pass, nouveau_mot_de_pass }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
}

export async function deleteAccount() {
    const token = getStoredToken()
    const response = await api.delete('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
    })
    removeStoredToken()
    return response.data
}

export function logout() {
    removeStoredToken()
}
