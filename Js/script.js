const display = document.querySelector(".calculator-display");
const buttons = document.querySelectorAll(".btn");
const historyBox = document.querySelector(".calculator-history");

let currentExpression = "";
let history = [];

// Update display content
function updateDisplay(content) {
  display.textContent = content || "0";
}

// Update calculation history
function updateHistory() {
  if (!historyBox) return;
  historyBox.innerHTML =
    "<h4>Recent History</h4>" +
    history.map((entry) => `<div>${entry}</div>`).join("");
}

// Append button value to current expression
function appendToExpression(value) {
  currentExpression += value;
  updateDisplay(currentExpression);
}

// Remove last character from expression
function deleteLast() {
  currentExpression = currentExpression.slice(0, -1);
  updateDisplay(currentExpression);
}

// Clear the entire expression
function clearAll() {
  currentExpression = "";
  updateDisplay("0");
}

// Evaluate expression safely
function evaluateExpression(expr) {
  try {
    // Replace symbols
    let parsed = expr.replace(/÷/g, "/").replace(/×/g, "*");

    // Convert percentages to division (e.g., 25% -> 25/100)
    parsed = parsed.replace(/(\d+(\.\d+)?)%/g, (_, num) => `(${num}/100)`);

    // Handle exponentiation using Math.pow
    while (parsed.includes("^")) {
      parsed = parsed.replace(
        /(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/,
        (_, base, exp) => `Math.pow(${base},${exp})`
      );
    }

    // Evaluate the final expression
    const result = Function(`"use strict"; return (${parsed})`)();

    if (typeof result !== "number" || !isFinite(result)) return "Error";

    return result;
  } catch {
    return "Error";
  }
}

// Handle equals (=) button
function calculateResult() {
  if (!currentExpression) return;

  const result = evaluateExpression(currentExpression);
  if (result === "Error") {
    updateDisplay("Error");
    currentExpression = "";
    return;
  }

  const historyEntry = `${currentExpression} = ${result}`;
  history.unshift(historyEntry);
  if (history.length > 5) history.pop();

  updateDisplay(result);
  currentExpression = result.toString();
  updateHistory();
}

// Button click events
buttons.forEach((button) => {
  const value = button.dataset.value;

  button.addEventListener("click", () => {
    if (value === "=") {
      calculateResult();
    } else if (value === "clear") {
      deleteLast();
    } else if (value === "c") {
      clearAll();
    } else {
      appendToExpression(value);
    }
  });
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (/^[0-9+\-*/.^()%]$/.test(key)) {
    appendToExpression(key);
  } else if (key === "Enter") {
    e.preventDefault();
    calculateResult();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key.toLowerCase() === "c") {
    clearAll();
  }
});
