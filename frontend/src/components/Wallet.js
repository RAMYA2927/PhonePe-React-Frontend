import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {fetchWallet, saveWallet} from "../services/api";

function Wallet(){
  const navigate = useNavigate();
  const storedWallet = JSON.parse(localStorage.getItem("wallet") || "null");
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(()=>{
    let isMounted = true;
    async function loadWalletData() {
      try{
        if (isMounted) setLoading(true);
        const response = await fetchWallet(storedWallet?.userName || storedWallet?.phoneNumber);
        const walletData = response.data ?? response;
        if (isMounted) {
          setWallet(walletData);
          saveWallet(walletData);
          setError("");
        }
      }catch(err){
        if (isMounted) setError(err?.message || "Unable to fetch wallet");
      }finally{
        if (isMounted) setLoading(false);
      }
    }
    loadWalletData();
    return () => { isMounted = false; };
  }, [storedWallet]);

  const balance = wallet?.balance ?? wallet?.data?.balance ?? 0;

  return(
    <div className="container">
      <h2>👛 Wallet</h2>
      {loading && <p>⏳ Loading wallet...</p>}
      {!loading && error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div>
          <p className="sub">👤 Name: {wallet?.fullName || wallet?.userName || "-"}</p>
          <p className="sub">📞 Phone: {wallet?.phoneNumber || "-"}</p>
          <p className="balance"> {Number(balance).toFixed(2)}</p>
        </div>
      )}
      <button onClick={()=>navigate("/transfer")}>💸 Send Money</button>
      <button onClick={()=>navigate("/history")}>📜 View History</button>
      <p className="link" onClick={()=>navigate("/dashboard")}>🏠 Back to Dashboard</p>
    </div>
  )
}

export default Wallet;
