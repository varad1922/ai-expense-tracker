import ExpenseCard from "./ExpenseCard";

function ExpenseList({ expenses, onDelete }) {
  return (
    <div>
      <h2>Expenses</h2>

      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default ExpenseList;