import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {updateUserPin} from "../services/api";

function UpdatePin(){
  const navigate = useNavigate();
  const [form, setForm] = useState({
    upi: "",
    oldPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [status, setStatus] = useState({type: "", message: ""});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
    setStatus({type: "", message: ""});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.upi || !form.oldPin || !form.newPin || !form.confirmPin) {
      setStatus({type: "error", message: "All fields are required"});
      return;
    }

    if (!/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/.test(form.upi)) {
      setStatus({type: "error", message: "Enter a valid UPI ID"});
      return;
    }

    if (!/^[0-9]{4,6}$/.test(form.oldPin) || !/^[0-9]{4,6}$/.test(form.newPin)) {
      setStatus({type: "error", message: "PIN must be 4-6 digits"});
      return;
    }

    if (form.newPin !== form.confirmPin) {
      setStatus({type: "error", message: "New PIN and confirm PIN must match"});
      return;
    }

    if (form.oldPin === form.newPin) {
      setStatus({type: "error", message: "New PIN must be different from old PIN"});
      return;
    }

    try {
      setLoading(true);
      const response = await updateUserPin({
        upi: form.upi,
        oldPin: form.oldPin,
        newPin: form.newPin,
      });
      setStatus({
        type: "success",
        message: response.message || "PIN updated successfully",
      });
      setForm({
        upi: form.upi,
        oldPin: "",
        newPin: "",
        confirmPin: "",
      });
    } catch (err) {
      setStatus({type: "error", message: err?.message || "Unable to update PIN"});
    } finally {
      setLoading(false);
    }
  };

  return(
    <div className="container">
      <h2 className="brand">📱 PhonePay</h2>
      <p className="subtext">🔐 Update your account PIN</p>

      <h2>🔄 Reset PIN</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="upi"
          placeholder="💳 UPI ID"
          value={form.upi}
          onChange={handleChange}
          autoComplete="username"
        />
        <input
          name="oldPin"
          type="password"
          placeholder="🔒 Current PIN"
          value={form.oldPin}
          onChange={handleChange}
          autoComplete="current-password"
        />
        <input
          name="newPin"
          type="password"
          placeholder="✨ New PIN"
          value={form.newPin}
          onChange={handleChange}
          autoComplete="new-password"
        />
        <input
          name="confirmPin"
          type="password"
          placeholder="✅ Confirm New PIN"
          value={form.confirmPin}
          onChange={handleChange}
          autoComplete="new-password"
        />
        <button type="submit" disabled={loading}>
          {loading ? "⏳ Updating..." : "🔐 Update PIN"}
        </button>
      </form>

      {status.message && (
        <p className={status.type === "error" ? "error" : "success"}>
          {status.message}
        </p>
      )}

      <p className="link" onClick={() => navigate("/")}>
        🔑 Back to Login
      </p>
    </div>
  );
}

export default UpdatePin;
