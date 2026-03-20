import React, {useEffect, useState} from "react";
import {refreshWallet, registerUser, saveWallet} from "../services/api";
import {useNavigate} from "react-router-dom";

function Register(){

 const navigate = useNavigate();

 const [user,setUser] = useState({
    name:"",
    phone:"",
    upi:"",
    initialBalance:"",
    pin:"",
    confirmPin:""
 })

 const [status,setStatus] = useState({type:"", message:""})
 const [loading,setLoading] = useState(false)

 const handleChange=(e)=>{
    setUser({...user,[e.target.name]:e.target.value})
    setStatus({type:"", message:""})
 }

 const handleSubmit=async(e)=>{
    e.preventDefault()

    if(user.pin!==user.confirmPin){
        setStatus({type:"error", message:"PIN not matched"})
        return
    }
    if(!user.phone || !user.name || !user.upi){
        setStatus({type:"error", message:"Name, phone, and UPI are required"})
        return
    }
    if(!/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/.test(user.upi)){
        setStatus({type:"error", message:"Enter a valid UPI (e.g., name@paytm)"})
        return
    }
    if(!/^[0-9]{4,6}$/.test(user.pin)){
        setStatus({type:"error", message:"PIN must be 4-6 digits"})
        return
    }
    if(user.initialBalance !== "" && Number(user.initialBalance) < 0){
        setStatus({type:"error", message:"Initial balance cannot be negative"})
        return
    }

    try{
        setLoading(true)
        const response = await registerUser(user)
        const authWallet = response.data ?? {}
        saveWallet(authWallet)
        try {
          await refreshWallet(authWallet.userName || authWallet.phoneNumber || user.phone, authWallet)
        } catch (refreshError) {
        }
        setStatus({type:"success", message:"Registration Successful"})
        navigate("/dashboard")
    }catch(err){
        const msg = err?.message || "Error registering user"
        setStatus({type:"error", message: msg})
    }finally{
        setLoading(false)
    }
 }

 useEffect(()=>{
    if(localStorage.getItem("wallet")){
        navigate("/dashboard")
    }
 },[navigate])

 return(
  <div className="container">

   <h2 className="brand">📱 PhonePay</h2>
   <p className="subtext">✨ Hello User</p>

   <h2>📝 Register</h2>

   <form onSubmit={handleSubmit}>

   <input name="name" placeholder="👤 Full Name" onChange={handleChange} autoComplete="name"/>

   <input name="phone" placeholder="📞 Phone Number" onChange={handleChange} autoComplete="tel"/>

   <input name="upi" placeholder="💳 UPI ID (e.g., name@paytm)" onChange={handleChange} autoComplete="username"/>

   <input
    name="initialBalance"
    type="number"
    min="0"
    step="0.01"
    placeholder="💰 Initial Balance"
    onChange={handleChange}
   />

   <input name="pin" placeholder="🔒 PIN" type="password" onChange={handleChange} autoComplete="new-password"/>

   <input name="confirmPin" placeholder="✅ Confirm PIN" type="password" onChange={handleChange} autoComplete="new-password"/>

   <button type="submit" disabled={loading}>{loading ? "⏳ Registering..." : "🚀 Register"}</button>

   </form>

   {status.message && (
    <p className={status.type === "error" ? "error" : "success"}>{status.message}</p>
   )}

   <p className="link" onClick={()=>navigate("/") }>
    🔑 Already have an account? Login here
   </p>

  </div>
 )
}

export default Register
