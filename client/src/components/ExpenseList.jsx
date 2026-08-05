import ExpenseCard from "./ExpenseCard";

function ExpenseList({ expenses }) {
  return (
    <div>
      <h2>Expenses</h2>

      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
        />
      ))}
    </div>
  );
}

export default ExpenseList;