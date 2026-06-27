import { BrowserRouter as Router } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import AppRoutes from './pages/Routes'
import { ErrorBoundary } from './components/ErrorBoundary'
import ToastContainer from './components/ToastContainer'
import { useWebVitals } from './hooks/useWebVitals'
import { useSpatialNavigation } from './hooks/useSpatialNavigation'

function App() {
  useWebVitals()
  useSpatialNavigation()
  
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <AppRoutes />
          <ToastContainer />
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App
