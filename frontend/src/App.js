import React from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Wallet from "./components/Wallet";
import Transfer from "./components/Transfer";
import History from "./components/History";
import UpdatePin from "./components/UpdatePin";
import "./App.css";

const ProtectedRoute = ({children})=>{
  const isAuthed = !!localStorage.getItem("wallet");
  return isAuthed ? children : <Navigate to="/" replace/>;
}

function App(){
  return(
    <Router>
      <Routes>

        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/update-pin" element={<UpdatePin/>}/>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        }/>
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Wallet/>
          </ProtectedRoute>
        }/>
        <Route path="/transfer" element={
          <ProtectedRoute>
            <Transfer/>
          </ProtectedRoute>
        }/>
        <Route path="/history" element={
          <ProtectedRoute>
            <History/>
          </ProtectedRoute>
        }/>
        <Route path="*" element={<Navigate to="/" replace/>}/>

      </Routes>
    </Router>
  )
}

export default App;
