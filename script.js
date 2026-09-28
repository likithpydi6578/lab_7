// State Variables
let currentInput = "0";
let previousInput = null;
let currentOperator = null;
let isNewCalculation = false;
let lastCalculatedOp = null;
let lastCalculatedSecondOperand = null;

// DOM Form References
const form = document.forms["calcForm"];
const displayElem = form.elements["display"];
const historyElem = form.elements["history"];
const clearBtn = document.getElementById("clearBtn");
const operatorButtons = document.querySelectorAll(".btn-op:not(#equalsBtn)");

// Mathematical Operations
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) { return b === 0 ? "Error" : a / b; }

function executeMath(first, second, op) {
  const a = parseFloat(first);
  const b = parseFloat(second);
  let res;

  switch (op) {
    case "+": res = add(a, b); break;
    case "−": res = subtract(a, b); break;
    case "×": res = multiply(a, b); break;
    case "÷": res = divide(a, b); break;
    default: return second;
  }

  if (res === "Error" || isNaN(res) || !isFinite(res)) {
    return "Error";
  }

  // Prevent floating point artifacts (e.g. 0.1 + 0.2 = 0.30000000000000004)
  const precisionClean = parseFloat(res.toPrecision(12));
  return precisionClean.toString();
}

// Format numbers for display with comma separators
function formatDisplayValue(val) {
  if (val === "Error") return "Error";
  if (val === "-0") return "-0";

  const parts = val.split(".");
  const intPart = parts[0];
  const decPart = parts.length > 1 ? "." + parts[1] : "";

  // Add commas to the integer part
  const formattedInt = Number(intPart).toLocaleString("en-US", {
    maximumFractionDigits: 0
  });

  return formattedInt + decPart;
}

// Auto-shrink text when digits get long
function autoScaleFont(str) {
  const len = str.length;
  if (len > 11) {
    displayElem.style.fontSize = "2.2rem";
  } else if (len > 8) {
    displayElem.style.fontSize = "2.8rem";
  } else if (len > 6) {
    displayElem.style.fontSize = "3.4rem";
  } else {
    displayElem.style.fontSize = "4rem";
  }
}

function updateScreen() {
  displayElem.value = formatDisplayValue(currentInput);
  autoScaleFont(displayElem.value);

  // Toggle AC / C label
  clearBtn.value = (currentInput === "0" && !previousInput) ? "AC" : "C";

  // Update history display
  if (previousInput !== null && currentOperator) {
    historyElem.value = `${formatDisplayValue(previousInput)} ${currentOperator}`;
  } else {
    historyElem.value = "";
  }
}

function clearActiveOperator() {
  operatorButtons.forEach(btn => btn.classList.remove("active"));
}

function highlightOperator(op) {
  clearActiveOperator();
  const target = Array.from(operatorButtons).find(btn => btn.dataset.op === op);
  if (target) target.classList.add("active");
}

// Button Handling
function handleNumber(num) {
  clearActiveOperator();

  if (currentInput === "Error") {
    currentInput = num;
    isNewCalculation = false;
    updateScreen();
    return;
  }

  if (isNewCalculation) {
    currentInput = num;
    isNewCalculation = false;
  } else {
    if (currentInput === "0") {
      currentInput = num;
    } else {
      if (currentInput.replace(/[-.]/g, "").length < 10) {
        currentInput += num;
      }
    }
  }
  updateScreen();
}

function handleDecimal() {
  clearActiveOperator();

  if (isNewCalculation || currentInput === "Error") {
    currentInput = "0.";
    isNewCalculation = false;
    updateScreen();
    return;
  }

  if (!currentInput.includes(".")) {
    currentInput += ".";
    updateScreen();
  }
}

function handleOperator(op) {
  if (currentInput === "Error") return;

  if (currentOperator && !isNewCalculation) {
    const result = executeMath(previousInput, currentInput, currentOperator);
    currentInput = result;
    previousInput = result;
  } else {
    previousInput = currentInput;
  }

  currentOperator = op;
  isNewCalculation = true;
  lastCalculatedOp = null;
  lastCalculatedSecondOperand = null;
  highlightOperator(op);
  updateScreen();
}

function handleEquals() {
  clearActiveOperator();
  if (currentInput === "Error") return;

  if (currentOperator) {
    lastCalculatedSecondOperand = currentInput;
    lastCalculatedOp = currentOperator;
    const result = executeMath(previousInput, currentInput, currentOperator);
    currentInput = result;
    previousInput = null;
    currentOperator = null;
    isNewCalculation = true;
  } else if (lastCalculatedOp && lastCalculatedSecondOperand) {
    // Repeated '=' press behaves like iOS
    currentInput = executeMath(currentInput, lastCalculatedSecondOperand, lastCalculatedOp);
    isNewCalculation = true;
  }

  updateScreen();
}

function handleClear() {
  clearActiveOperator();
  if (clearBtn.value === "C" && currentInput !== "0") {
    currentInput = "0";
    if (!currentOperator) {
      previousInput = null;
    }
  } else {
    currentInput = "0";
    previousInput = null;
    currentOperator = null;
    lastCalculatedOp = null;
    lastCalculatedSecondOperand = null;
  }
  isNewCalculation = false;
  updateScreen();
}

function handlePlusMinus() {
  if (currentInput === "Error" || currentInput === "0") return;
  currentInput = currentInput.startsWith("-") ? currentInput.slice(1) : "-" + currentInput;
  updateScreen();
}

function handlePercentage() {
  if (currentInput === "Error") return;
  const num = parseFloat(currentInput);
  if (!isNaN(num)) {
    if (previousInput && currentOperator && (currentOperator === "+" || currentOperator === "−")) {
      // In iOS: 100 + 10% = 100 + 10
      currentInput = (parseFloat(previousInput) * (num / 100)).toString();
    } else {
      currentInput = (num / 100).toString();
    }
    updateScreen();
  }
}

// Event Delegation for Form Clicks
form.addEventListener("click", (e) => {
  const target = e.target;
  if (!target || target.type !== "button") return;

  const val = target.value;

  if (target.classList.contains("btn-num")) {
    if (val === ".") handleDecimal();
    else handleNumber(val);
  } else if (target.dataset.op) {
    handleOperator(target.dataset.op);
  } else if (target.id === "equalsBtn") {
    handleEquals();
  } else if (target.id === "clearBtn") {
    handleClear();
  } else if (target.id === "plusMinusBtn") {
    handlePlusMinus();
  } else if (target.id === "percentBtn") {
    handlePercentage();
  }
});

// Full Keyboard Support
window.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") handleNumber(e.key);
  else if (e.key === ".") handleDecimal();
  else if (e.key === "+" || e.key === "-") handleOperator(e.key === "-" ? "−" : "+");
  else if (e.key === "*") handleOperator("×");
  else if (e.key === "/") {
    e.preventDefault();
    handleOperator("÷");
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    handleEquals();
  } else if (e.key === "Escape") {
    handleClear();
  } else if (e.key === "%") {
    handlePercentage();
  } else if (e.key === "Backspace") {
    // Backspace: slice off digit or reset to 0
    if (currentInput.length > 1 && currentInput !== "Error" && !isNewCalculation) {
      currentInput = currentInput.slice(0, -1);
      if (currentInput === "-" || currentInput === "") currentInput = "0";
    } else {
      currentInput = "0";
    }
    updateScreen();
  }
});

// Initialize Display
updateScreen();