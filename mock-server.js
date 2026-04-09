// Simple mock API for PhonePay demo
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const users = [];
const balances = {};
const transactions = [];

const normalizeIdentifier = (value) => {
  if (!value) return "";
  return String(value).trim().toLowerCase();
};

const findUser = ({ phone, upi, identifier }) => {
  const normalizedPhone = normalizeIdentifier(phone);
  const normalizedUpi = normalizeIdentifier(upi);
  const normalizedIdentifier = normalizeIdentifier(identifier);

  return users.find((user) => {
    const userPhone = normalizeIdentifier(user.phone);
    const userUpi = normalizeIdentifier(user.upi);
    const userName = normalizeIdentifier(user.userName || user.upi || user.phone);
    return (
      (normalizedPhone && userPhone === normalizedPhone) ||
      (normalizedUpi && userUpi === normalizedUpi) ||
      (normalizedIdentifier && (userPhone === normalizedIdentifier || userUpi === normalizedIdentifier || userName === normalizedIdentifier))
    );
  });
};

const publicWallet = (user) => ({
  name: user.name,
  fullName: user.name,
  userName: user.userName,
  phone: user.phone,
  phoneNumber: user.phone,
  upi: user.upi,
  token: user.token,
  balance: balances[user.phone] ?? 0,
});

const buildTransaction = ({type, fromUser, toUser, amount, note}) => ({
  id: transactions.length + 1,
  type,
  amount: Number(amount),
  note: note || "",
  from: fromUser?.phone || null,
  to: toUser?.phone || null,
  sender: fromUser?.userName || fromUser?.phone || null,
  receiver: toUser?.userName || toUser?.phone || null,
  timestamp: new Date().toISOString(),
});

app.post("/api/auth/register", (req, res) => {
  const {name, phone, upi, pin, phoneNumber, initialBalance} = req.body;
  const registeredPhone = phone || phoneNumber;

  if (!name || !registeredPhone || !upi || !pin) {
    return res.status(400).json({message: "Name, phone, UPI and PIN are required"});
  }

  if (findUser({ phone: registeredPhone }) || findUser({ upi })) {
    return res.status(409).json({message: "User already registered"});
  }

  const token = `demo-token-${registeredPhone}`;
  const user = {
    name,
    userName: upi,
    phone: registeredPhone,
    upi,
    pin,
    token,
  };

  users.push(user);
  balances[registeredPhone] = Number(initialBalance || 1000);

  res.status(201).json(publicWallet(user));
});

app.post("/api/auth/login", (req, res) => {
  const {upi, pin} = req.body;
  if (!upi || !pin) {
    return res.status(400).json({message: "UPI and PIN are required"});
  }

  const user = findUser({ upi });
  if (!user || user.pin !== pin) {
    return res.status(401).json({message: "Invalid UPI or PIN"});
  }

  res.json(publicWallet(user));
});

app.post("/api/auth/update-pin", (req, res) => {
  const {upi, oldPin, newPin} = req.body;
  if (!upi || !oldPin || !newPin) {
    return res.status(400).json({message: "UPI, current PIN and new PIN are required"});
  }

  const user = findUser({ upi });
  if (!user || user.pin !== oldPin) {
    return res.status(401).json({message: "Invalid UPI or current PIN"});
  }

  user.pin = newPin;
  res.json({message: "PIN updated successfully"});
});

app.get("/api/wallets", (req, res) => {
  res.json(users.map(publicWallet));
});

app.get("/api/wallets/:key", (req, res) => {
  const key = req.params.key;
  const user = findUser({ identifier: key });

  if (!user) {
    return res.status(404).json({message: "Wallet not found"});
  }

  res.json(publicWallet(user));
});

app.post("/api/payments/transfer", (req, res) => {
  const {fromPhone, toPhone, amount, pin, fromUserName, toUserName, sender, receiver, note} = req.body;
  const payer = findUser({ phone: fromPhone, identifier: fromUserName, upi: sender });
  const payee = findUser({ phone: toPhone, identifier: toUserName, upi: receiver });

  if (!payer) {
    return res.status(404).json({message: "Sender not found"});
  }
  if (payer.pin !== pin) {
    return res.status(401).json({message: "Wrong PIN"});
  }

  const transferAmount = Number(amount);
  if (!transferAmount || transferAmount <= 0) {
    return res.status(400).json({message: "Invalid amount"});
  }

  if (!payee) {
    return res.status(404).json({message: "Recipient not found"});
  }

  balances[payer.phone] = (balances[payer.phone] || 0) - transferAmount;
  balances[payee.phone] = (balances[payee.phone] || 0) + transferAmount;

  const txn = buildTransaction({
    type: "transfer",
    fromUser: payer,
    toUser: payee,
    amount: transferAmount,
    note,
  });

  transactions.push(txn);
  res.json({message: "Transfer successful", note});
});

app.get("/api/payments/history", (req, res) => {
  const userKey = req.query.userName;
  if (!userKey) {
    return res.status(400).json({message: "userName query parameter is required"});
  }

  const user = findUser({ identifier: userKey });
  if (!user) {
    return res.status(404).json({message: "User not found"});
  }

  const related = transactions.filter((txn) => {
    const normalized = normalizeIdentifier(user.userName || user.phone);
    return (
      normalizeIdentifier(txn.sender) === normalized ||
      normalizeIdentifier(txn.receiver) === normalized
    );
  });

  res.json(related);
});

app.listen(9091, () => {
  console.log("Mock API running at http://localhost:9091/api");
});
