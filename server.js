const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 3000;
const API_KEY = "26ef5347ec0e452392ef217536dc87cf";

// EMA
function calculateEMA(prices, period) {
  let k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

// RSI
function calculateRSI(prices, period = 14) {
  let gains = 0, losses = 0;

  for (let i = 1; i <= period; i++) {
    let diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let rs = gains / losses || 1;
  return 100 - (100 / (1 + rs));
}

// ⚡ CACHE SYSTEM (FAST)
let lastSignal = null;
let lastTime = 0;

// SIGNAL API
app.get("/signal", async (req, res) => {
  try {
    const now = Date.now();

    if (now - lastTime < 5000 && lastSignal) {
      return res.json(lastSignal);
    }

    const symbol = req.query.symbol || "EUR/USD";

    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&apikey=${API_KEY}`;

    const response = await axios.get(url);
    const data = response.data.values;

    const closes = data.map(c => parseFloat(c.close)).reverse();

    const ema = calculateEMA(closes, 10);
    const rsi = calculateRSI(closes, 14);
    const price = closes[closes.length - 1];

    let signal = "WAIT";

    // 🔥 IMPROVED LOGIC (LESS WAIT + SMART)
    if (rsi < 40) signal = "UP 📈";
    else if (rsi > 60) signal = "DOWN 📉";

    if (price > ema && rsi < 50) signal = "UP 📈";
    if (price < ema && rsi > 50) signal = "DOWN 📉";

    lastSignal = { signal, rsi, ema, price };
    lastTime = now;

    res.json(lastSignal);

  } catch (err) {
    res.json({ error: "API error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});

<script>
let stake = 1;
let wins = 0;
let losses = 0;

// Chart update
document.getElementById("market").addEventListener("change", function() {
  let symbol = this.value.replace("/", "");
  document.getElementById("chart").src =
  "https://s.tradingview.com/widgetembed/?symbol=FX:" + symbol + "&interval=1";
});

// GET SIGNAL
function getSignal() {
  let market = document.getElementById("market").value;

  document.getElementById("signal").innerText = "Loading...";

  fetch("http://127.0.0.1:3000/signal?symbol=" + market)
  .then(res => res.json())
  .then(data => {
    document.getElementById("signal").innerText = data.signal;
    document.getElementById("extra").innerText =
      "RSI: " + data.rsi.toFixed(2) +
      " | Price: " + data.price.toFixed(5);
  })
  .catch(() => {
    alert("Backend connect nahi ho raha!");
  });
}

// Win
function win() {
  wins++;
  stake *= 2;
  update();
}

// Loss
function loss() {
  losses++;
  stake = 1;
  update();
}

function update() {
  document.getElementById("stake").innerText = stake;
  document.getElementById("wins").innerText = wins;
  document.getElementById("losses").innerText = losses;

  let total = wins + losses;
  let wr = total ? Math.round((wins / total) * 100) : 0;
  document.getElementById("wr").innerText = wr + "%";
}
</script>
