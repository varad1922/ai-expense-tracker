function ExpenseCard({ expense, onDelete, onEdit }){
    return(
        <div>
            <h3>{expense.title}</h3>
            
            <p>₹{expense.amount}</p>

            <button onClick={()=> onEdit(expense.id)}>
                Edit
            </button>

            <button onClick={() => onDelete(expense.id)}>
                Delete
            </button>
            
            <hr />
        </div>
    );
}
export default ExpenseCard;