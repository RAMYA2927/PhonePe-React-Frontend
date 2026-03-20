import axios from "axios";

export const API_BASE = process.env.REACT_APP_API_URL || "";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

const getPrimaryIdentifier = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return (
    value.userName ||
    value.username ||
    value.phoneNumber ||
    value.phone ||
    ""
  );
};


// Include auth token if ever provided by backend.
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("wallet");
  if (stored) {
    const wallet = JSON.parse(stored);
    const token = wallet?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const unwrapApiResponse = (response) => {
  const res = response?.data;
  if (!res || typeof res !== "object") {
    throw new Error("Invalid server response");
  }

  if (!("success" in res) || !("message" in res) || !("timestamp" in res)) {
    throw new Error("Unexpected API response shape");
  }

  if (res.success === false) {
    const err = new Error(res.message || "Request failed");
    err.response = response;
    throw err;
  }

  return res;
};

api.interceptors.response.use(
  (response) => unwrapApiResponse(response),
  (error) => {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Network or server error";
    const wrapped = new Error(msg);
    wrapped.response = error.response;
    throw wrapped;
  }
);

// Auth
const normalizePhone = (phone, phoneNumber) => phoneNumber || phone;
const normalizeWallet = (wallet) => {
  if (!wallet || typeof wallet !== "object") {
    return wallet;
  }

  return {
    ...wallet,
    userName: wallet.userName || wallet.username || wallet.phoneNumber || wallet.phone,
    phoneNumber: wallet.phoneNumber || wallet.phone,
    phone: wallet.phone || wallet.phoneNumber,
    fullName: wallet.fullName || wallet.name || wallet.userName,
  };
};

export const saveWallet = (wallet) => {
  const normalizedWallet = normalizeWallet(wallet);
  localStorage.setItem("wallet", JSON.stringify(normalizedWallet));
  return normalizedWallet;
};

export const registerUser = ({ name, upi, phone, phoneNumber, pin, initialBalance }) =>
  api.post("/api/auth/register", {
    name,
    upi,
    phone: normalizePhone(phone, phoneNumber),
    phoneNumber: normalizePhone(phone, phoneNumber),
    pin,
    initialBalance: Number(initialBalance || 0),
  });

const resolveWalletUserName = async (identifier) => {
  const key = getPrimaryIdentifier(identifier);
  if (!key) {
    return "";
  }

  const walletResponse = await fetchWallet(key);
  const wallet = normalizeWallet(walletResponse.data ?? walletResponse);
  return wallet?.userName || key;
};

export const loginUser = async ({ upi, pin }) => {
  return api.post("/api/auth/login", {
    upi,
    pin,
  });
};

export const updateUserPin = ({ upi, oldPin, newPin }) =>
  api.post("/api/auth/update-pin", {
    upi,
    oldPin,
    newPin,
  });

// Wallet + payments
export const fetchWallet = async (identifier) => {
  const key = getPrimaryIdentifier(identifier);

  if (key) {
    try {
      return await api.get(`/api/wallets/${encodeURIComponent(key)}`);
    } catch (error) {
      const message = error?.message || "";
      const isNotFound =
        error?.response?.status === 404 ||
        /wallet not found/i.test(message) ||
        /resource not found/i.test(message);

      if (!isNotFound) {
        throw error;
      }
    }
  }

  const response = await api.get("/api/wallets");
  const wallets = response.data ?? response;

  if (!key) {
    return response;
  }

  const matchedWallet = Array.isArray(wallets)
    ? wallets.find((wallet) => {
        const normalizedWallet = normalizeWallet(wallet);
        return (
          normalizedWallet?.userName === key ||
          normalizedWallet?.phoneNumber === key ||
          normalizedWallet?.phone === key
        );
      })
    : wallets;

  if (!matchedWallet) {
    const err = new Error("Wallet not found");
    err.response = { status: 404 };
    throw err;
  }

  return {
    ...response,
    success: true,
    message: response.message || "Wallet fetched successfully",
    data: matchedWallet,
    timestamp: response.timestamp || new Date().toISOString(),
  };
};

export const transferMoney = ({
  fromPhone,
  toPhone,
  amount,
  pin,
  note,
  fromUserName,
  toUserName,
}) =>
  Promise.all([
    fromUserName
      ? Promise.resolve(fromUserName)
      : resolveWalletUserName(fromPhone),
    toUserName
      ? Promise.resolve(toUserName)
      : resolveWalletUserName(toPhone),
  ]).then(([sender, receiver]) =>
    api.post("/api/payments/transfer", {
      sender,
      receiver,
      fromPhone,
      fromUserName,
      toPhone,
      toUserName,
      amount,
      pin,
      note,
    })
  );

export const fetchHistory = (identifier) => {
  const key = getPrimaryIdentifier(identifier);
  return api.get("/api/payments/history", {
    params: key ? { userName: key } : undefined,
  });
};

export const refreshWallet = async (identifier, fallbackWallet = null) => {
  try {
    const walletResponse = await fetchWallet(identifier);
    return saveWallet(walletResponse.data ?? walletResponse);
  } catch (error) {
    if (fallbackWallet) {
      return saveWallet(fallbackWallet);
    }
    throw error;
  }
};

export const refreshHistory = async (identifier) => {
  const historyResponse = await fetchHistory(identifier);
  return historyResponse.data ?? historyResponse;
};
