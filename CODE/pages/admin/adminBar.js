import Link from "next/link";
import styles from '/styles/admin/adminBar.module.css';
import { useRouter } from "next/router";

export default function AdminBar() {
  const handleLogout = () => {
    localStorage.removeItem("user_acc_id");
    localStorage.removeItem("user_role");
    router.push("/login");
  };

  const router = useRouter();
  return (
    <div className={styles.SideBar}>
      <div className={styles.MenuSection}>
        <ul>
          <li>
            <Link href="/admin/adminAccount" className={styles.menuItem}>
              <img src="/image/useracc.png" alt="Account Icon" className={styles.menuIcon} />
              <span className={styles.menuText}>Account</span>
              <img src="/image/arrow.png" alt="Account Icon" className={styles.menuArrow} />
            </Link>
          </li>

          <li>
            <Link href="/admin/adminProduct" className={styles.menuItem}>
              <img src="/image/cube.png" alt="product Icon" className={styles.menuIcon} />
              <span className={styles.menuText}>Product</span>
              <img src="/image/arrow.png" alt="product Icon" className={styles.menuArrow} />
            </Link>
          </li>

          <li>
            <Link href="/admin/adminUser" className={styles.menuItem}>
              <img src="/image/usersalt.png" alt="User Icon" className={styles.menuIcon} />
              <span className={styles.menuText}>User</span>
              <img src="/image/arrow.png" alt="User Icon" className={styles.menuArrow} />
            </Link>
          </li>


          <li>
            <Link href="/admin/adminEditData" className={styles.menuItem}>
              <img src="/image/edit.png" alt="Management Icon" className={styles.menuIcon} />
              <span className={styles.menuText}>Management</span>
              <img src="/image/arrow.png" alt="Management Icon" className={styles.menuArrow} />
            </Link>
          </li>

          <li>
            <Link href="/admin/adminReview" className={styles.menuItem}>
              <img src="/image/socialnetwork.png" alt="Review Icon" className={styles.menuIcon} />
              <span className={styles.menuText}>Review</span>
              <img src="/image/arrow.png" alt="Review Icon" className={styles.menuArrow} />
            </Link>
          </li>


          <li>
            <a onClick={() => {
              localStorage.removeItem("user_acc_id");
              router.push("/login");
            }} className={styles.menuItem} style={{ cursor: "pointer" }}>
              <img src="/image/exit.png" alt="Logout Icon" className={styles.menuIcon} />
              <span className={styles.menuText}>Logout</span>
              <img src="/image/arrow.png" alt="Arrow" className={styles.menuArrow} />
            </a>
          </li>

        </ul>
      </div>
    </div>
  )
}