function ExpenseForm({
  title,
  amount,
  setTitle,
  setAmount,
  handleAddExpense,
}) {
  return (
    <div>
      <input
        type="text"
        placeholder="Enter Expense"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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

      <button onClick={handleAddExpense}>
        Add Expense
      </button>
    </div>
  );
}

export default ExpenseForm;