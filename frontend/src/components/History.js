import React, {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {fetchHistory} from "../services/api";

function History(){
  const navigate = useNavigate();
  const wallet = JSON.parse(localStorage.getItem("wallet") || "null");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async ()=>{
    if(!wallet?.userName && !wallet?.phoneNumber){
      setError("Missing wallet identifier");
      setLoading(false);
      return;
    }
    try{
      setLoading(true);
      const response = await fetchHistory(wallet.userName || wallet.phoneNumber);
      const historyData = response.data ?? response;
      setItems(historyData?.transactions || historyData?.data || historyData || []);
      setError("");
    }catch(err){
      setError(err?.message || "Unable to load history");
    }finally{
      setLoading(false);
    }
  }, [wallet?.phoneNumber, wallet?.userName]);

  useEffect(()=>{ load(); }, [load]);

  return(
    <div className="container">
      <h2>📜 Transactions</h2>
      {loading && <p>⏳ Loading...</p>}
      {!loading && error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div>
          {items.length === 0 && <p>🪄 No transactions yet.</p>}
          {items.map((tx, idx)=>(
            <div key={idx} className="card">
              <div className="row">
                <span className="label">📤 From:</span><span>{tx.sender || tx.fromPhone || tx.from || "-"}</span>
              </div>
              <div className="row">
                <span className="label">📥 To:</span><span>{tx.receiver || tx.toPhone || tx.to || "-"}</span>
              </div>
              <div className="row">
                <span className="label">Amount:</span><span> {Number(tx.amount || 0).toFixed(2)}</span>
              </div>
              <div className="row">
                <span className="label">📝 Note:</span><span>{tx.note || "-"}</span>
              </div>
              <div className="row">
                <span className="label">✅ Status:</span><span>{tx.status || "success"}</span>
              </div>
              <div className="row">
                <span className="label">📅 Date:</span><span>{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="link" onClick={()=>navigate("/dashboard")}>🏠 Back to Dashboard</p>
    </div>
  )
}

export default History;
