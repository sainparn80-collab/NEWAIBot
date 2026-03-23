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

  // ✅ FIXED BACKEND URL
  fetch("https://newaibot-production.up.railway.app/signal?symbol=" + market)
  .then(res => res.json())
  .then(data => {

    if (!data || data.error) {
      document.getElementById("signal").innerText = "❌ Error";
      return;
    }

    document.getElementById("signal").innerText = data.signal;

    document.getElementById("extra").innerText =
      "RSI: " + (data.rsi?.toFixed(2) || "-") +
      " | Price: " + (data.price?.toFixed(5) || "-");

  })
  .catch(() => {
    document.getElementById("signal").innerText = "⚠️ Backend Error";
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
