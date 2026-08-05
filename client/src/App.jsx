import { useState } from "react";
import ExpenseList from "./components/ExpenseList";
import ExpenseForm from "./components/ExpenseForm";

function App() {

  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");

  const [amount, setAmount] = useState("");

function handleAddExpense() {
  if (title.trim() === "" || amount.trim() === "") {
    alert("Please enter both title and amount.");
    return;
  }

  if (Number(amount) <= 0) {
    alert("Amount must be greater than 0.");
    return;
  }
  
  const newExpense = {
    id: Date.now(),
    title,
    amount: Number(amount),
  };

  setExpenses([
    newExpense,
    ...expenses,
  ]);

  setTitle("");
  setAmount("");

}

  return (
    <div>

      <h1>Expense Tracker</h1>

      <ExpenseForm
        title={title}
        amount={amount}
        setTitle={setTitle}
        setAmount={setAmount}
        handleAddExpense={handleAddExpense}
      />

      <ExpenseList expenses={expenses} />

    </div>
  );
}

export default App;