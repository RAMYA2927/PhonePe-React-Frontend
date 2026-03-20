// Simple mock API for PhonePay demo
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let users = [];          // {name, phone, upi, pin, token}
let balances = {};       // phone -> number

app.post("/api/auth/register", (req, res) => {
  const {name, phone, upi, pin} = req.body;
  if (!name || !phone || !upi || !pin) {
    return res.status(400).json({message: "All fields required"});
  }
  if (users.find(u => u.phone === phone)) {
    return res.status(409).json({message: "Phone already registered"});
  }
  const user = {name, phone, upi, pin, token: `demo-token-${phone}`};
  users.push(user);
  balances[phone] = 1000; // start balance
  res.status(201).json(user);
});

app.post("/api/auth/login", (req, res) => {
  const {phone, pin} = req.body;
  const user = users.find(u => u.phone === phone && u.pin === pin);
  if (!user) return res.status(401).json({message: "Invalid phone or PIN"});
  res.json(user);
});

app.get("/api/wallet/balance", (req, res) => {
  const {phone} = req.query;
  if (!phone || balances[phone] == null) return res.status(404).json({message: "User not found"});
  res.json({balance: balances[phone]});
});

app.post("/api/payments/send", (req, res) => {
  const {fromPhone, toPhone, amount, note, pin} = req.body;
  const sender = users.find(u => u.phone === fromPhone);
  if (!sender) return res.status(404).json({message: "Sender not found"});
  if (sender.pin !== pin) return res.status(401).json({message: "Wrong PIN"});
  const amt = Number(amount);
  if (!amt || amt <= 0) return res.status(400).json({message: "Invalid amount"});
  balances[fromPhone] = (balances[fromPhone] || 0) - amt;
  balances[toPhone] = (balances[toPhone] || 0) + amt; // create receiver if missing
  res.json({message: "Transfer successful", note});
});

app.listen(8080, () => {
  console.log("Mock API running at http://localhost:8080/api");
});
