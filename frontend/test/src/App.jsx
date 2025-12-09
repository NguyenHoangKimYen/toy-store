import AppRoutes from './routes/AppRoutes'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import './App.css'

const App = () => {
  return (
      <>
        <Toaster />
        <AppRoutes />
      </>
  )
}

export default App
