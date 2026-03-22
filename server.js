const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const API_KEY = "26ef5347ec0e452392ef217536dc87cf";

// 🔐 Fake DB (replace with MongoDB later)
let validKeys = ["VIP123", "PRO456"];

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

// 🔐 License Middleware
function checkKey(req, res, next) {
  const key = req.query.key;
  if (!validKeys.includes(key)) {
    return res.json({ error: "Invalid License Key" });
  }
  next();
}

// 🚀 SIGNAL API
app.get("/signal", checkKey, async (req, res) => {
  try {
    const symbol = req.query.symbol || "EUR/USD";

    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&apikey=${API_KEY}`;
    const response = await axios.get(url);

    const closes = response.data.values.map(c => parseFloat(c.close)).reverse();

    const ema10 = EMA(closes, 10);
    const ema20 = EMA(closes, 20);
    const rsi = RSI(closes, 14);
    const price = closes[closes.length - 1];

    let trend = ema10 > ema20 ? "UP" : "DOWN";

    let signal = "WAIT";

    // 🔥 PRO LOGIC
    if (trend === "UP" && rsi < 45 && price > ema10) {
      signal = "UP 📈";
    }
    else if (trend === "DOWN" && rsi > 55 && price < ema10) {
      signal = "DOWN 📉";
    }

    res.json({ signal, rsi, price, trend });

  } catch (err) {
    res.json({ error: "API error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running...");
});
