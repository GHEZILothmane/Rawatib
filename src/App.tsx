import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Contact } from './pages/Contact'
import { DashboardLayout } from './components/DashboardLayout'
import { Dashboard } from './pages/dashboard/Dashboard'
import { Employees } from './pages/dashboard/Employees'
import { Departments } from './pages/dashboard/Departments'
import { Payslips } from './pages/dashboard/Payslips'
import { SalaryCalculator } from './pages/dashboard/SalaryCalculator'
import { Leaves } from './pages/dashboard/Leaves'
import { Attendance } from './pages/dashboard/Attendance'
import { Declarations } from './pages/dashboard/Declarations'
import { Settings } from './pages/dashboard/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Dashboard protégé */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="payslips" element={<Payslips />} />
          <Route path="salary-calc" element={<SalaryCalculator />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="declarations" element={<Declarations />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
