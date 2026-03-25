import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HeatMapPage from './pages/HeatMap/HeatMapPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HeatMapPage />} />
          {/* Routes des autres membres */}
          {/* <Route path="/classement" element={<ClassementPage />} /> */}
          {/* <Route path="/admin" element={<AdminPage />} /> */}
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
