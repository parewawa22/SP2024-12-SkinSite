import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from '../../styles/routineSet/createRoutine.module.css'; 
import Link from "next/link";
import NavBar from "/components/NavBar";
import UserBar from "/components/UserSidebar";
import Footer from "/components/Footer";

export default function CreateRoutine() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accid, setAccid] = useState(null);
  const [routines, setRoutines] = useState([]);
  const router = useRouter();

  const morningRoutines = routines.filter(r => r.routineType === "Morning");
  const nightRoutines = routines.filter(r => r.routineType === "Night");

  useEffect(() => {
    const id = localStorage.getItem("user_acc_id");
    if (!id) router.push("/login");
    else setAccid(id);
  }, []);

  useEffect(() => {
    if (!accid) return;

    const fetchRoutines = async () => {
      try {
        const res = await fetch(`/api/routine/api_getRoutineSet?accid=${accid}`); // ดึงมาทุกรูทีน 
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API Error: ${res.status} - ${text}`);
        }
        const data = await res.json();
        console.log("Routines:", data.routines);
        setRoutines(data.routines);
      } catch (error) {
        console.error("Error fetching routines:", error);
      }
    };

    fetchRoutines();
  }, [accid]);

  return (
    <div className={styles.main}>
      <NavBar />
      <div className={styles.mobileUserBarToggle}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>User Bar ▾</button>
      </div>

      <div className={styles.body}>
        {/* <UserBar /> */}
        {(typeof window !== "undefined" && (sidebarOpen || window.innerWidth >= 768)) && <UserBar />}

        <div className={styles.content}>
          <div className={styles.RoutineSet}>
            <h2> My Routine Set </h2>

            <div className={styles.Set}>
              <div className={styles.textSet}>
                <h4> Morning Set </h4>
                <img src="/image/sun.png" alt="sun Icon" style={{ width: '20px', height: '20px', marginLeft: '6px' }} />
              </div>

              <div className={styles.createSet}>
                {morningRoutines.map((routine, index) => (
                  <div key={routine.routine_id} className={styles.add}>
                    <Link href={`/routineSet/morningRoutineDetail?routine_id=${routine.routine_id}`}>
                      <div style={{ textAlign: "center", marginTop: "50px", fontWeight: "bold" }}>
                        {routine.routineName}
                      </div>
                    </Link>
                  </div>
                ))}

                <div className={styles.add}>
                  <Link href={"/routineSet/morningStep"}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.9286 8.57143H8.57143V13.9286C8.57143 14.2127 8.45855 14.4853 8.25761 14.6862C8.05668 14.8871 7.78416 15 7.5 15C7.21584 15 6.94332 14.8871 6.74239 14.6862C6.54145 14.4853 6.42857 14.2127 6.42857 13.9286V8.57143H1.07143C0.787268 8.57143 0.514746 8.45855 0.313814 8.25761C0.112883 8.05668 0 7.78416 0 7.5C0 7.21584 0.112883 6.94332 0.313814 6.74239C0.514746 6.54145 0.787268 6.42857 1.07143 6.42857H6.42857V1.07143C6.42857 0.787268 6.54145 0.514746 6.74239 0.313814C6.94332 0.112882 7.21584 0 7.5 0C7.78416 0 8.05668 0.112882 8.25761 0.313814C8.45855 0.514746 8.57143 0.787268 8.57143 1.07143V6.42857H13.9286C14.2127 6.42857 14.4853 6.54145 14.6862 6.74239C14.8871 6.94332 15 7.21584 15 7.5C15 7.78416 14.8871 8.05668 14.6862 8.25761C14.4853 8.45855 14.2127 8.57143 13.9286 8.57143Z" fill="black" />
                    </svg>
                  </Link>
                </div>

              </div>
            </div>

            {/* night set */}
            <div className={styles.Set}>
              <div className={styles.textSet}>
                <h4> Night Set </h4>
                <img src="/image/moon.png" alt="Moon Icon" style={{ width: '20px', height: '20px', marginLeft: '6px' }} />
              </div>

              <div className={styles.createSet}>
                {nightRoutines.map((routine) => (
                  <div key={routine.routine_id} className={styles.add}>
                    <Link href={`/routineSet/nightRoutineDetail?routine_id=${routine.routine_id}`}>
                      <div style={{ textAlign: "center", marginTop: "50px", fontWeight: "bold" }}>
                        {routine.routineName}
                      </div>
                    </Link>
                  </div>
                ))}

                <div className={styles.add}>
                  <Link href={"/routineSet/nightStep"}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.9286 8.57143H8.57143V13.9286C8.57143 14.2127 8.45855 14.4853 8.25761 14.6862C8.05668 14.8871 7.78416 15 7.5 15C7.21584 15 6.94332 14.8871 6.74239 14.6862C6.54145 14.4853 6.42857 14.2127 6.42857 13.9286V8.57143H1.07143C0.787268 8.57143 0.514746 8.45855 0.313814 8.25761C0.112883 8.05668 0 7.78416 0 7.5C0 7.21584 0.112883 6.94332 0.313814 6.74239C0.514746 6.54145 0.787268 6.42857 1.07143 6.42857H6.42857V1.07143C6.42857 0.787268 6.54145 0.514746 6.74239 0.313814C6.94332 0.112882 7.21584 0 7.5 0C7.78416 0 8.05668 0.112882 8.25761 0.313814C8.45855 0.514746 8.57143 0.787268 8.57143 1.07143V6.42857H13.9286C14.2127 6.42857 14.4853 6.54145 14.6862 6.74239C14.8871 6.94332 15 7.21584 15 7.5C15 7.78416 14.8871 8.05668 14.6862 8.25761C14.4853 8.45855 14.2127 8.57143 13.9286 8.57143Z" fill="black" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
