import { useState } from "react";
import ExpenseList from "./components/ExpenseList";
import ExpenseForm from "./components/ExpenseForm";

function App() {

  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");

  const [amount, setAmount] = useState("");

  const [editingId, setEditingId] = useState(null);

function handleAddExpense() {
  if (title.trim() === "" || amount.trim() === "") {
    alert("Please enter both title and amount.");
    return;
  }


  if (Number(amount) <= 0) {
    alert("Amount must be greater than 0.");
    return;
  }

  if (editingId !== null) {
  setExpenses(
    expenses.map((expense) =>
      expense.id === editingId
        ? {
            ...expense,
            title,
            amount: Number(amount),
          }
        : expense
     ) 
    );

    setEditingId(null);
    setTitle("");
    setAmount("");

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

function handleDeleteExpense(id){
  setExpenses(
    expenses.filter((expense)=>expense.id !== id)
  );
}

function handleEditExpense(id){
  const expenseToEdit = expenses.find(
    (expense)=>expense.id===id
  );

  setTitle(expenseToEdit.title);
  setAmount(expenseToEdit.amount.toString());
  setEditingId(id);
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
        editingId={editingId}
      />

      <ExpenseList
        expenses={expenses}
        onDelete={handleDeleteExpense}
        onEdit={handleEditExpense}
      />

    </div>
  );
}

export default App;