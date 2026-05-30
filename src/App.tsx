import { BrowserRouter as Router } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import AppRoutes from './pages/Routes'

function App() {
  return (
    <Router>
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  )
}

export default App
