const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

let validKeys = ["VIP123", "PRO456"];

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

// License
function checkKey(req, res, next) {
  const key = req.query.key;
  if (!validKeys.includes(key)) {
    return res.json({ error: "Invalid License Key" });
  }
  next();
}

// SIGNAL API
app.get("/signal", checkKey, async (req, res) => {
  try {
    let symbol = req.query.symbol || "BTCUSDT";

    // 🔥 FIX: remove slash if exists
    symbol = symbol.replace("/", "");

    // CACHE
    if (Date.now() - lastFetch < 10000 && cache) {
      return res.json(cache);
    }

    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=50`;
    const response = await axios.get(url);

    // 🔥 ERROR HANDLE
    if (!Array.isArray(response.data)) {
      return res.json({ error: "Invalid Binance response" });
    }

    const closes = response.data.map(c => parseFloat(c[4]));

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

    cache = result;
    lastFetch = Date.now();

    res.json(result);

  } catch (err) {
    console.log("BINANCE ERROR:", err.message);
    res.json({ error: "Binance API error" });
  }
});

app.get("/", (req, res) => {
  res.send("Binance Bot Running 🚀");
});

app.listen(PORT, () => {
  console.log("Server running...");
});
