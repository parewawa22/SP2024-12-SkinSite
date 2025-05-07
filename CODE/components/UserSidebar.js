import Link from "next/link";
import styles from '/styles/user/UserSidebar.module.css';
import { useRouter } from "next/router";

export default function UserBar({ }) {

  const router = useRouter();

  return (
    <div className={styles.SideBar}>
      <div className={styles.MenuSection}>
        <ul>
          <li>
            <Link href="/account" className={styles.menuItem}>
              <img src="/image/account.png" alt="Account Icon" className={styles.menuIcon} />
              <span className={styles.menuText}>Account</span>
              <img src="/image/arrow.png" alt="Account Icon" className={styles.menuArrow} />
            </Link>
          </li>

          <li>
            <Link href="/reviewhis" className={styles.menuItem}>
              <img src="/image/review.png" alt="Review Icon" className={styles.menuIcon} />
              <span className={styles.menuText}>Reviews</span>
              <img src="/image/arrow.png" alt="Review Icon" className={styles.menuArrow} />
            </Link>
          </li>

          <li>
            <Link href="/wishlist" className={styles.menuItem}>
              <img src="/image/wishlist.png" alt="Wishlist Icon" className={styles.menuIcon} />
              <span className={styles.menuText}>Wishlist</span>
              <img src="/image/arrow.png" alt="Wishlist Icon" className={styles.menuArrow} />
            </Link>
          </li>


          <li>
            <Link href="/routineSet/createRoutine" className={styles.menuItem}>
              <img src="/image/skincare.png" alt="Skincare Icon" className={styles.menuIcon} />
              <span className={styles.menuText}>My Skincare</span>
              <img src="/image/arrow.png" alt="Skincare Icon" className={styles.menuArrow} />
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