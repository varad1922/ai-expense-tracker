function Navbar(props) {
    console.log(props);
    return (
        <nav>
          <h2>{props.title}</h2>
        </nav>
    );
}
export default Navbar;