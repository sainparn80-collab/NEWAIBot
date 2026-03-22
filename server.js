const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔑 MULTIPLE API KEYS
const API_KEYS = [
  "9f5b507c40b44025a963bbaf95414d65",
  "6460e5c6e8544998b96bea95fb9518b9",
  "19df026300c34d19ab38381c6b9ccc0c"
];

// 🔐 License
let validKeys = ["VIP123", "PRO456"];

// 📦 CACHE SYSTEM
let cache = null;
let lastFetch = 0;

// EMA
function EMA(prices, period) {
  let k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

// RSI
function RSI(prices, period = 14) {
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    let diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let rs = gains / losses || 1;
  return 100 - (100 / (1 + rs));
}

// 🔐 License check
function checkKey(req, res, next) {
  const key = req.query.key;
  if (!validKeys.includes(key)) {
    return res.json({ error: "Invalid License Key" });
  }
  next();
}

// 🔄 Smart Fetch System
async function fetchData(symbol) {
  for (let key of API_KEYS) {
    try {
      console.log("Trying key:", key);

      const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&apikey=${key}`;
      const res = await axios.get(url);

      if (res.data.code) {
        console.log("Failed:", res.data.message);
        continue;
      }

      if (res.data.values) {
        console.log("Success key:", key);
        return res.data;
      }

    } catch (err) {
      console.log("Error key:", key);
      continue;
    }
  }
  return null;
}

// 🚀 SIGNAL API
app.get("/signal", checkKey, async (req, res) => {
  try {
    let symbol = req.query.symbol || "EUR/USD";
    symbol = symbol.replace("/", "");

    // 🔥 CACHE (15 sec)
    if (Date.now() - lastFetch < 15000 && cache) {
      return res.json(cache);
    }

    const data = await fetchData(symbol);

    if (!data) {
      return res.json({ error: "All APIs failed" });
    }

    const closes = data.values.map(c => parseFloat(c.close)).reverse();

    const ema10 = EMA(closes, 10);
    const ema20 = EMA(closes, 20);
    const rsi = RSI(closes, 14);
    const price = closes[closes.length - 1];

    let trend = ema10 > ema20 ? "UP" : "DOWN";
    let signal = "WAIT";

    // 🔥 IMPROVED LOGIC
    if (trend === "UP" && rsi < 45 && price > ema10) {
      signal = "UP 📈";
    } else if (trend === "DOWN" && rsi > 55 && price < ema10) {
      signal = "DOWN 📉";
    }

    const result = { signal, rsi, price, trend };

    cache = result;
    lastFetch = Date.now();

    res.json(result);

  } catch (err) {
    console.log(err.message);
    res.json({ error: "Server error" });
  }
});

// Home
app.get("/", (req, res) => {
  res.send("AI Signal Bot PRO Running 🚀");
});

app.listen(PORT, () => {
  console.log("Server running...");
});
