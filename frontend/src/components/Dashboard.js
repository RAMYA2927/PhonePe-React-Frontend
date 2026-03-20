import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";

function Dashboard(){

 const navigate = useNavigate()

 const wallet = JSON.parse(localStorage.getItem("wallet"))

 useEffect(()=>{
    if(!wallet){
        navigate("/")
    }
 },[wallet,navigate])

 const logout=()=>{
    localStorage.removeItem("wallet")
    navigate("/")
 }

 return(

  <div className="container">

  <h2>👋 Hello, {wallet?.fullName || wallet?.userName || "User"}</h2>

  <p className="sub">📞 Phone: {wallet?.phoneNumber || "NA"}</p>
  <p className="sub">💰 Balance:  {Number(wallet?.balance || 0).toFixed(2)}</p>

  <button onClick={()=>navigate("/transfer")}>💸 Send Money</button>
  <button onClick={()=>navigate("/wallet")}>👛 Wallet</button>
  <button onClick={()=>navigate("/history")}>📜 Transactions</button>
  <button onClick={()=>navigate("/update-pin")}>🔐 Update PIN</button>

  <button onClick={logout}>🚪 Logout</button>

  </div>
 )
}

export default Dashboard
