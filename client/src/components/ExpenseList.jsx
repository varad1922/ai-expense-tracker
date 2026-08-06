import ExpenseCard from "./ExpenseCard";

function ExpenseList({ expenses, onDelete, onEdit }) {
  return (
    <div>
      <h2>Expenses</h2>

      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default ExpenseList;