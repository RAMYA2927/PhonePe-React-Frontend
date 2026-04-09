import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {refreshHistory, refreshWallet, transferMoney} from "../services/api";

function SendMoney(){

  const navigate = useNavigate();
  const wallet = JSON.parse(localStorage.getItem("wallet") || "null");

  const [form, setForm] = useState({
    toPhone: "",
    amount: "",
    note: "",
    pin: ""
  });

  const [status, setStatus] = useState({type: "", message: ""});
  const [loading, setLoading] = useState(false);

  const handleChange = (e)=>{
    setForm({...form, [e.target.name]: e.target.value});
    setStatus({type:"", message:""});
  }

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setStatus({type:"", message:""});

    const amountNum = Number(form.amount);
    if(isNaN(amountNum) || amountNum <= 0){
      setStatus({type:"error", message:"Enter a valid amount"});
      return;
    }
    if(!form.toPhone || form.toPhone.length < 8){
      setStatus({type:"error", message:"Enter a valid recipient phone"});
      return;
    }
    if(!form.pin){
      setStatus({type:"error", message:"PIN is required"});
      return;
    }

    try{
      setLoading(true);
      const transferResponse = await transferMoney({
        fromPhone: wallet?.phone,
        fromUserName: wallet?.userName,
        toPhone: form.toPhone,
        amount: amountNum,
        note: form.note,
        pin: form.pin
      });
      const identifier = wallet?.userName || wallet?.phone || wallet?.phoneNumber;
      if (identifier) {
        await Promise.all([
          refreshWallet(identifier),
          refreshHistory(identifier),
        ]);
      }
      setStatus({
        type:"success",
        message: transferResponse.message || "Money sent successfully"
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
        <input
          name="toPhone"
          placeholder="📞 Recipient Phone"
          value={form.toPhone}
          onChange={handleChange}
        />
        <input
          name="amount"
          type="number"
          placeholder="💰 Amount"
          value={form.amount}
          onChange={handleChange}
        />
        <input
          name="note"
          placeholder="📝 Note (optional)"
          value={form.note}
          onChange={handleChange}
        />
        <input
          name="pin"
          type="password"
          placeholder="🔒 Your PIN"
          value={form.pin}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>{loading ? "⏳ Sending..." : "🚀 Send"}</button>
      </form>
      {status.message && (
        <p className={status.type === "error" ? "error" : "success"}>
          {status.message}
        </p>
      )}
      <p className="link" onClick={()=>navigate("/dashboard")}>🏠 Back to Dashboard</p>
    </div>
  )
}

export default SendMoney;
