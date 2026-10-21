function calculate() {
  // Read string values from the input fields
  const num1Val = document.getElementById("num1").value;
  const num2Val = document.getElementById("num2").value;
  const operation = document.getElementById("operation").value;
  const output = document.getElementById("output");

  // Check if inputs are empty
  if (num1Val.trim() === "" || num2Val.trim() === "") {
    output.innerText = "Please enter both numbers.";
    output.style.color = "red";
    return;
  }

  // Convert inputs to numbers
  const num1 = parseFloat(num1Val);
  const num2 = parseFloat(num2Val);
  let result;

  // Perform calculation based on the selected dropdown value
  switch (operation) {
    case "add":
      result = num1 + num2;
      break;

    case "subtract":
      result = num1 - num2;
      break;

    case "multiply":
      result = num1 * num2;
      break;

    case "divide":
      if (num2 === 0) {
        output.innerText = "Cannot divide by zero!";
        output.style.color = "red";
        return;
      }
      result = num1 / num2;
      break;

    default:
      output.innerText = "Invalid operation selected.";
      output.style.color = "red";
      return;
  }

  // Display the calculation result
  output.innerText = result;
  output.style.color = "#007bff";
}

// Clear or reset the output message
function clearResult() {
  const output = document.getElementById("output");
  output.innerText = "Enter numbers and click Calculate";
  output.style.color = "#222222";
}
