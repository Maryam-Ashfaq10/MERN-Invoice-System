
import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import CreateInvoice from './pages/CreateInvoice'
import ViewInvoices from './pages/ViewInvoices'

function App() {

  return (
    <>
      <section id="center">


        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoice/new" element={<CreateInvoice />} />
              <Route path="/invoices/all" element={<ViewInvoices />} />
            </Route>
          </Route>

        </Routes>

      </section>

    </>
  )
}

export default App
