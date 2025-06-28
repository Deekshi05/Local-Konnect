import Navbar from './components/layout/Navbar.jsx';
import About from './pages/About/About.jsx';
import MakeTender from './pages/Tendors/Maketender.jsx';
import SelectContractorsPage from './pages/Tendors/SelectContractorsPage.jsx';
import Mytendors from './pages/Profile/MyTendors.jsx';
import Services from './pages/Services/Services.jsx';
import Visualize from './pages/visulaizer/Visualize.jsx';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import Contractors from './pages/Contractors/ContractorComp/Contractors.jsx';
// import Paints from './pages/Contractors/ContractorComp/Paints.jsx';
import { Routes, Route, Navigate } from "react-router-dom";
import Footer from './components/layout/Footer.jsx';
import './App.css';
import ProtectedRoute from './ProtectedRoute';
import Profile from "./pages/Profile/ProfilePage.jsx";
import { ToastContainer } from "react-toastify";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />
}
function Registerandlogout() {
  localStorage.clear();
  return <Register />
}
function App() {
  return (
    <>
     <ToastContainer position="top-right" autoClose={3000} />  
      <Navbar />
      <Routes>
        <Route path="/" element={
          // <ProtectedRoute>
          <Home />
          // </ProtectedRoute>
        } />

        <Route path="/about" element={
          // <ProtectedRoute>
          <About />
          //  </ProtectedRoute>
        } />

        <Route path="/services" element={
          //  <ProtectedRoute>
          <Services />
          //  </ProtectedRoute>
        } />

        <Route path="/visualize" element={
          //  <ProtectedRoute>
          <Visualize />
          //  </ProtectedRoute>
        } />

        <Route path="/make-tender" element={
          <ProtectedRoute>
            <MakeTender />
          </ProtectedRoute>
        } />
        
        <Route path="/select-contractors" element={
          <ProtectedRoute>
            <SelectContractorsPage />
          </ProtectedRoute>
        } />


        <Route path="/mytendors" element={
          <ProtectedRoute>
            <Mytendors />
          </ProtectedRoute>
        } />

        <Route path="/contractors" element={
          // <ProtectedRoute>
          <Contractors />
          //  </ProtectedRoute>
        } />


        <Route path="/Register" element={
          <Register />
        } />

        <Route path="/Login" element={
          <Login />
        } />

        <Route path="/Logout" element={
          <Logout />
        } />
        <Route path="/profile" element={
          <Profile />
        } />
      </Routes>
      <Footer />
    </>
  );
}
export default App;
