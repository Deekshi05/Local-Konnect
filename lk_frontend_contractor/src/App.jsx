import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ContractorRegister from "./pages/ContractorRegister"
import NotFound from "./pages/NotFound"
import Home from "./pages/Home"
import ProtectedRoute from "./components/ProtectedRoute"
import ACard from "./pages/new_tender_card"
import ContractorProfile from "./pages/contractorProfile"
import ForgotPassword from "./pages/Forgot"
import NewTenders from "./pages/newTendersContractor"
import AppliedTenders from "./pages/appliedTendersContractor"
import AllottedTenders from "./pages/allottedTendersContractor"
import CompletedTenders from "./pages/completedTendersContractor"
import OngoingTenders from "./pages/ongoingTendersContractor"
import TenderBidForm from "./pages/tenderBidForm"

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/Home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/Forgot" element={<ForgotPassword />} />
        <Route path="/ContractorRegister" element={<ContractorRegister/>}/>
        <Route
          path="/newTendersContractor"
          element={
            <ProtectedRoute>
              <NewTenders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appliedTendersContractor"
          element={
            <ProtectedRoute>
              <AppliedTenders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allottedTendersContractor"
          element={
            <ProtectedRoute>
              <AllottedTenders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/completedTendersContractor"
          element={
            <ProtectedRoute>
              <CompletedTenders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ongoingTendersContractor"
          element={
            <ProtectedRoute>
              <OngoingTenders />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/new_tender_card"
          element={
            <ProtectedRoute>
              <ACard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/contractorProfile"
          element={
            <ProtectedRoute>
              <ContractorProfile />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/tenderBidForm"
          element={
            <ProtectedRoute>
              <TenderBidForm />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
