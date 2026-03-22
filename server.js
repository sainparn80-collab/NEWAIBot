const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔑 ADD YOUR 3 API KEYS HERE
const API_KEYS = [
  "API_KEY_1",
  "API_KEY_2",
  "API_KEY_3"
];

// 🔐 License keys
let validKeys = ["VIP123", "PRO456"];

// 📦 CACHE
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

// 🔄 Fetch with fallback keys
async function fetchData(symbol) {
  for (let key of API_KEYS) {
    try {
      const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&apikey=${key}`;
      const res = await axios.get(url);

      if (res.data && res.data.values) {
        return res.data;
      }

    } catch (err) {
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

    // 🔥 CACHE (10 sec)
    if (Date.now() - lastFetch < 10000 && cache) {
      return res.json(cache);
    }

    const data = await fetchData(symbol);

    if (!data || !data.values) {
      return res.json({ error: "All API keys failed" });
    }

    const closes = data.values.map(c => parseFloat(c.close)).reverse();

    if (closes.length < 20) {
      return res.json({ error: "Not enough data" });
    }

    const ema10 = EMA(closes, 10);
    const ema20 = EMA(closes, 20);
    const rsi = RSI(closes, 14);
    const price = closes[closes.length - 1];

    let trend = ema10 > ema20 ? "UP" : "DOWN";
    let signal = "WAIT";

    if (trend === "UP" && rsi < 45 && price > ema10) {
      signal = "UP 📈";
    } else if (trend === "DOWN" && rsi > 55 && price < ema10) {
      signal = "DOWN 📉";
    }

    const result = { signal, rsi, price, trend };

    // 💾 Save cache
    cache = result;
    lastFetch = Date.now();

    res.json(result);

  } catch (err) {
    console.log("ERROR:", err.message);
    res.json({ error: "Server error" });
  }
});

// Home route
app.get("/", (req, res) => {
  res.send("AI Signal Bot Backend Running 🚀");
});

app.listen(PORT, () => {
  console.log("Server running...");
});
