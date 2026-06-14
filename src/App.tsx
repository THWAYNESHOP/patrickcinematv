import { BrowserRouter as Router } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import AppRoutes from './pages/Routes'
import { ErrorBoundary } from './components/ErrorBoundary'
import ToastContainer from './components/ToastContainer'

function App() {
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
