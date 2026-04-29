import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import HeatMapPage from './pages/HeatMap/HeatMapPage'
import AuthPage from './pages/Auth/AuthPage'
import AddTransactionPage from './pages/Transaction/AddTransactionPage'
import ClassementPage from './pages/classement/ClassementPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HeatMapPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/ajouter" element={<AddTransactionPage />} />
            <Route path="/classement" element={<ClassementPage />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
