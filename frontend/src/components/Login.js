import React,{useEffect, useState} from "react";
import {loginUser, refreshWallet, saveWallet} from "../services/api";
import {useNavigate} from "react-router-dom";

function Login(){

 const navigate = useNavigate()

 const [data,setData]=useState({
    upi:"",
    pin:""
 })

 const [status,setStatus] = useState({type:"", message:""})
 const [loading,setLoading] = useState(false)

 const handleChange=(e)=>{
    setData({...data,[e.target.name]:e.target.value})
    setStatus({type:"", message:""})
 }

 const handleSubmit=async(e)=>{
    e.preventDefault()

    if(!data.upi || !data.pin){
        setStatus({type:"error", message:"UPI ID and PIN are required"})
        return
    }
    if(!/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/.test(data.upi)){
        setStatus({type:"error", message:"Enter a valid UPI ID"})
        return
    }
    if(!/^[0-9]{4,6}$/.test(data.pin)){
        setStatus({type:"error", message:"PIN must be 4-6 digits"})
        return
    }

    try{
        setLoading(true)
        const response = await loginUser(data)
        const authWallet = response.data ?? {}
        saveWallet(authWallet)
        try {
          await refreshWallet(authWallet.userName || authWallet.phoneNumber || data.upi, authWallet)
        } catch (refreshError) {
        }
        setStatus({type:"success", message:"Login successful"})
        navigate("/dashboard")
    }catch(err){
        setStatus({type:"error", message: err?.message || "Invalid login"})
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

  <h2 className="brand">PhonePay</h2>
  <p className="subtext">Malla Reddy College of Engineering</p>

  <h2>Login</h2>

  <form onSubmit={handleSubmit}>

  <input name="upi" placeholder="UPI ID" onChange={handleChange} autoComplete="username"/>

  <input name="pin" placeholder="PIN" type="password" onChange={handleChange} autoComplete="current-password"/>

  <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>

  </form>

  {status.message && (
    <p className={status.type === "error" ? "error" : "success"}>{status.message}</p>
  )}

  <p onClick={()=>navigate("/register")} className="link">
  Create new account
  </p>

  <p onClick={()=>navigate("/update-pin")} className="link">
  Forgot / Update PIN
  </p>

  </div>
 )
}

export default Login
