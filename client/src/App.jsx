import { useState } from "react";

function App() {

  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");

  const [amount, setAmount] = useState("");

function handleAddExpense() {
  if (title.trim() === "" || amount === "") {
    alert("Please enter both title and amount.");
    return;
  }
  
  const newExpense = {
    id: Date.now(),
    title: title,
    amount: Number(amount),
  };

  setExpenses([
  ...expenses,
  newExpense,
  ]);

  setTitle("");
  setAmount("");

}

  return (
    <div>

      <h1>Expense Tracker</h1>

      <input
        type="text"
        placeholder="Enter Expense"
        value={title}
        onChange={(event)=> setTitle(event.target.value)}
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleAddExpense}>Add Expense</button>

      <h2>Expenses</h2>

      {
        expenses.map((expense) => (
        <div key={expense.id}>
        <h3>{expense.title}</h3>
        <p>₹{expense.amount}</p>
        <hr />
        </div>
      ))
    }

    </div>
  );
}

export default App;