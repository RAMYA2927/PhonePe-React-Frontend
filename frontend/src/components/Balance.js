import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {fetchWallet} from "../services/api";

function Balance(){
  const navigate = useNavigate();
  const wallet = JSON.parse(localStorage.getItem("wallet") || "null");

  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBalance = async ()=>{
    const identifier = wallet?.userName || wallet?.phoneNumber || wallet?.phone;
    if(!identifier){
      setError("Missing wallet identifier.");
      setLoading(false);
      return;
    }
    try{
      setLoading(true);
      const res = await fetchWallet(identifier);
      const walletData = res.data ?? res;
      setBalance(walletData?.balance ?? 0);
      setError("");
    }catch(err){
      setError(err?.response?.data?.message || err?.message || "Unable to fetch balance");
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
