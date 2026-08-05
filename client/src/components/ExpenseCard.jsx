function ExpenseCard({ expense, onDelete }){
    return(
        <div>
            <h3>{expense.title}</h3>
            
            <p>₹{expense.amount}</p>

            <button onClick={() => onDelete(expense.id)}>
                Delete
            </button>
            
            <hr />
        </div>
    );
}
export default ExpenseCard;