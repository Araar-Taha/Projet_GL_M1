import { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // On mount, check if there's a stored token and load profile
    useEffect(() => {
        const token = authService.getStoredToken()
        if (token) {
            authService.getProfile()
                .then(userData => setUser(userData))
                .catch(() => {
                    authService.removeStoredToken()
                    setUser(null)
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = async ({ email, mot_de_pass }) => {
        const data = await authService.login({ email, mot_de_pass })
        setUser(data.user)
        return data
    }

    const register = async ({ nom, prenom, email, mot_de_pass }) => {
        const data = await authService.register({ nom, prenom, email, mot_de_pass })
        setUser(data.user)
        return data
    }

    const logout = () => {
        authService.logout()
        setUser(null)
    }

    const updateProfile = async (profileData) => {
        const data = await authService.updateProfile(profileData)
        setUser(data.user)
        return data
    }

    const changePassword = async (passwordData) => {
        return await authService.changePassword(passwordData)
    }

    const deleteAccount = async () => {
        await authService.deleteAccount()
        setUser(null)
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
