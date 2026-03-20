import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {fetchBalance} from "../services/api";

function Balance(){
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBalance = async ()=>{
    if(!user?.phone){
      setError("Missing phone on user profile.");
      setLoading(false);
      return;
    }
    try{
      setLoading(true);
      const res = await fetchBalance(user.phone);
      setBalance(res.data?.balance ?? res.data);
      setError("");
    }catch(err){
      setError(err?.response?.data?.message || "Unable to fetch balance");
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    loadBalance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return(
    <div className="container">
      <h2>💰 Wallet Balance</h2>
      {loading && <p>⏳ Loading balance...</p>}
      {!loading && error && <p className="error">{error}</p>}
      {!loading && !error && (
        <p className="balance">â‚¹ {Number(balance || 0).toFixed(2)}</p>
      )}
      <button onClick={loadBalance} disabled={loading}>
        {loading ? "⏳ Refreshing..." : "🔄 Refresh"}
      </button>
      <p className="link" onClick={()=>navigate("/dashboard")}>🏠 Back to Dashboard</p>
    </div>
  )
}

export default Balance;
