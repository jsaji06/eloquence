import { Routes, BrowserRouter, Route } from "react-router-dom";
import EditDocument from "./components/EditDocument/EditDocument";
import Login from "./components/LoginSignup/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import Signup from './components/LoginSignup/Signup';
import EmailVerification from './components/LoginSignup/EmailVerification';
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import Landing from "./components/Landing/Landing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/verification" element={<EmailVerification />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/editor/:document_id" element={<EditDocument />}></Route>
      </Routes>
    </BrowserRouter>
  )
}
