import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import styles from '../../styles/routineSet/routineDetail.module.css'; 
import Link from "next/link";
import NavBar from "/components/NavBar";
import UserBar from "/components/UserSidebar";
import Footer from "/components/Footer";

export default function RoutineDetail() {
  const router = useRouter();
  const { routine_id } = router.query;
  const [products, setProducts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchRoutineProducts = async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/routine/api_getRoutineDetail?routine_id=${routine_id}&_=${timestamp}`);
      const data = await res.json();
      console.log("Routine detail data:", data);
      setProducts(data.products || []);
      setRoutineName(data.routineName || ""); 
    } catch (err) {
      console.error("Error loading routine details:", err);
    }
  };

  useEffect(() => {
    if (!routine_id) return;
    fetchRoutineProducts();
  }, [routine_id, router.query.reload]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (router.query.routine_id) {
        fetchRoutineProducts();
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router]);

  const handleDelete = async (stepid) => {
    if (!confirm("Are you sure you want to delete this step?")) return;
    try {
      const res = await fetch(`/api/routine/api_deleteRoutineStep?stepid=${stepid}`, { method: "DELETE" });
      const result = await res.json();
      console.log("✅ Delete result:", result);
      await fetchRoutineProducts(); 
    }
    catch (err) {
      console.error("Failed to delete step:", err);
    }
  };

  const handleAddStep = (stepOrder) => {
    router.push(`/routineSet/morningStep?order=${stepOrder}&routine_id=${routine_id}`);
  };

  const handleEditStep = (stepid, stepOrder) => {
    router.push(`/routineSet/morningStep?edit=true&stepid=${stepid}&routine_id=${routine_id}&order=${stepOrder}`);
  };

  const handleDeleteRoutine = async () => {
    try {
      const res = await fetch(`/api/routine/api_deleteRoutineSet`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routine_id }),
      });

      if (!res.ok) throw new Error("Failed to delete routine");

      alert("✅ Routine deleted!");
      router.push("/routineSet/createRoutine");
    } catch (err) {
      alert("❌ Failed to delete routine");
      console.error(err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    const fetchRoutineName = async () => {
      if (!routine_id) return;

      try {
        const res = await fetch(`/api/routine/api_getRoutineDetail?routine_id=${routine_id}`);
        const data = await res.json();

        if (data?.routineName) {
          setRoutineName(data.routineName);
        }
      } catch (error) {
        console.error("❌ Failed to fetch routine name", error);
      }
    };

    fetchRoutineName();
  }, [routine_id]);

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
            <p> Routine Set Detail </p>

            <h1>
              {isEditingName ? (
                <div className={styles.editNameSession}>
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    style={{ marginRight: "12px", padding: "5px", fontSize: "20px" }}
                  />
                  <div className={styles.editNamebutton}>
                    <button onClick={async () => {
                      try {
                        const res = await fetch('/api/routine/api_updateRoutineName', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            routine_id,
                            newRoutineName: routineName,  
                          }),
                        });

                        if (!res.ok) throw new Error("Failed to update name");
                        alert("✅ Name updated!");
                        setIsEditingName(false);
                      } catch (err) {
                        alert("❌ Failed to update name");
                        console.error(err);
                      }
                    }}>
                      💾 Save
                    </button>
                    <button onClick={() => setIsEditingName(false)}>❌ Cancel</button>
                  </div>
                </div>
              ) : (
                <div className={styles.editName}>
                  {routineName}
                  <FaEdit className={styles.editIcon} onClick={() => setIsEditingName(true)} />
                </div>
              )}
            </h1>

            <div className={styles.Set}>
              <div className={styles.textSet}>
                <h4> Morning Set </h4>
                <img src="/image/sun.png" alt="sun Icon" style={{ width: '20px', height: '20px', marginLeft: '6px' }} />
              </div>

              <div className={styles.createSet}>
                {[1, 2, 3, 4, 5, 6].map((stepNum, index) => {
                  const product = products.find((p) => p.stepOrder === stepNum);
                  return (
                    <div className={styles.stepCard} key={index}>
                      <div className={styles.stepHeader}>Step {stepNum}</div>
                      {product ? (
                        <Link href={`/productInfo?pdid=${product.pdid}`} className={styles.innerStepCard}>
                          <img src={product.photo || "/image/ProductImage/notfoundProduct.png"} alt={product.productName} className={styles.pdImage} />
                          <div className={styles.pdDetails}>
                            <h3>{product.productName}</h3>
                            <p className={styles.description}>{product.description}</p>
                            <p><strong>{Number(product.price).toFixed(2)} THB</strong></p>
                            <div className={styles.actionButtons}>
                              <FaEdit className={styles.editIcon} onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditStep(product.step_id, product.stepOrder);
                              }} />
                              <FaTrashAlt className={styles.deleteIcon} onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(product.step_id);
                              }} />
                            </div>
                          </div>
                        </Link>
                      ) : (
                        // Add product button
                        <div className={styles.emptyStep} onClick={() => handleAddStep(stepNum)}>
                          <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.3571 13.1429H13.1429V21.3571C13.1429 21.7929 12.9698 22.2107 12.6617 22.5188C12.3536 22.8269 11.9357 23 11.5 23C11.0643 23 10.6464 22.8269 10.3383 22.5188C10.0302 22.2107 9.85714 21.7929 9.85714 21.3571V13.1429H1.64286C1.20714 13.1429 0.789278 12.9698 0.481182 12.6617C0.173087 12.3536 0 11.9357 0 11.5C0 11.0643 0.173087 10.6464 0.481182 10.3383C0.789278 10.0302 1.20714 9.85714 1.64286 9.85714H9.85714V1.64286C9.85714 1.20714 10.0302 0.789277 10.3383 0.481181C10.6464 0.173086 11.0643 0 11.5 0C11.9357 0 12.3536 0.173086 12.6617 0.481181C12.9698 0.789277 13.1429 1.20714 13.1429 1.64286V9.85714H21.3571C21.7929 9.85714 22.2107 10.0302 22.5188 10.3383C22.8269 10.6464 23 11.0643 23 11.5C23 11.9357 22.8269 12.3536 22.5188 12.6617C22.2107 12.9698 21.7929 13.1429 21.3571 13.1429Z" fill="black" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <button className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete Routine
          </button>

          {showDeleteModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3>⚠️ Confirm Delete</h3>
                <p>Are you sure you want to delete this routine?</p>
                <button onClick={handleDeleteRoutine}>Yes, Delete</button>
                <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
