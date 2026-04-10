
import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
function App() {

  return (
    <>
      <section id="center">
      
        <div>
          <h1 className=''>Invoice Management System</h1>
         
        </div>
        <Routes>
          <Route path="/signup" element={<Login />} />
        </Routes>
        
      </section>

    </>
  )
}

export default App
