import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {refreshHistory, refreshWallet, transferMoney} from "../services/api";

function Transfer(){
  const navigate = useNavigate();
  const wallet = JSON.parse(localStorage.getItem("wallet") || "null");

  const [form, setForm] = useState({
    toPhone: "",
    amount: "",
    note: "",
    pin: ""
  });
  const [status, setStatus] = useState({type:"", message:""});
  const [loading, setLoading] = useState(false);

  const handleChange = (e)=>{
    setForm({...form, [e.target.name]: e.target.value});
    setStatus({type:"", message:""});
  }

  const handleSubmit = async (e)=>{
    e.preventDefault();
    if(!wallet?.phoneNumber){
      setStatus({type:"error", message:"Missing sender phone in wallet"});
      return;
    }
    if(!form.toPhone || !form.amount || !form.pin){
      setStatus({type:"error", message:"Recipient, amount and PIN are required"});
      return;
    }
    if(Number(form.amount) <= 0){
      setStatus({type:"error", message:"Amount must be greater than 0"});
      return;
    }
    try{
      setLoading(true);
      const transferResponse = await transferMoney({
        fromPhone: wallet.phoneNumber,
        fromUserName: wallet.userName,
        toPhone: form.toPhone,
        amount: Number(form.amount),
        pin: form.pin,
        note: form.note
      });
      await Promise.all([
        refreshWallet(wallet.userName || wallet.phoneNumber, wallet),
        refreshHistory(wallet.userName || wallet.phoneNumber),
      ]);
      setStatus({
        type:"success",
        message: transferResponse.message || "Transfer successful"
      });
      setForm({toPhone:"", amount:"", note:"", pin:""});
    }catch(err){
      setStatus({type:"error", message: err?.message || "Transfer failed"});
    }finally{
      setLoading(false);
    }
  }

  return(
    <div className="container">
      <h2>💸 Send Money</h2>
      <form onSubmit={handleSubmit}>
        <input name="toPhone" placeholder="📞 Recipient Phone" value={form.toPhone} onChange={handleChange}/>
        <input name="amount" type="number" placeholder="💰 Amount" value={form.amount} onChange={handleChange}/>
        <input name="note" placeholder="📝 Note (optional)" value={form.note} onChange={handleChange}/>
        <input name="pin" type="password" placeholder="🔒 Your PIN" value={form.pin} onChange={handleChange}/>
        <button type="submit" disabled={loading}>{loading ? "⏳ Sending..." : "🚀 Send"}</button>
      </form>
      {status.message && <p className={status.type === "error" ? "error" : "success"}>{status.message}</p>}
      <p className="link" onClick={()=>navigate("/dashboard")}>🏠 Back to Dashboard</p>
    </div>
  )
}

export default Transfer;
