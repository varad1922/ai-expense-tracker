function ExpenseCard({ expense }){
    return(
        <div>
            <h3>{expense.title}</h3>
            
            <p>₹{expense.amount}</p>
            
            <hr />
        </div>
    );
}
export default ExpenseCard;