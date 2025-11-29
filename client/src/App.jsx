import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ListingPage from "./pages/ListingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";

function App() {

  return (
    <Router>
      <Navbar/>  {/*  Navbar appears on all pages */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings/:id" element={<ListingPage />} />
        <Route path="/login" element={<LoginPage />} />       
        <Route path="/register" element={<RegisterPage />} /> 
      </Routes>
    </Router>
  )
  
}

export default App
