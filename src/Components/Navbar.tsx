import { Link } from "react-router-dom";
import styles from "./Navbar.module.css"


function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarBrand}>
                <Link to={"/"}>Wasi's</Link>
            </div>
            <div className={styles.navbarLinks}>
                <Link to={"/"} className={styles.navLink}>Home</Link>
                <Link to={"/favorites"} className={styles.navLink}>Favorites</Link>
            </div>
        </nav>
    );
};
export default Navbar;
