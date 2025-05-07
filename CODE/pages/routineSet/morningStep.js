import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import styles from '/styles/routineSet/step.module.css';
import Link from "next/link";
import NavBar from "/components/NavBar";
import UserBar from "/components/UserSidebar";
import Footer from "/components/Footer";

export default function Step() {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedStep, setSelectedStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productNameMap, setProductNameMap] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const router = useRouter();
  const { stepid, order, routine_id, edit } = router.query;
  const isEditMode = edit === "true";

  const [routineIdFromQuery, setRoutineIdFromQuery] = useState(null);

  const [confirmModal, setConfirmModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);

  const goToStep = (step) => {
    setSelectedStep(step);
    const filtered = filterProductsByStep(allProducts, step);
    setProducts(filtered);

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, order: step },
      },
      undefined,
      { shallow: true }
    );
  };

  const getLineWidth = () => {
    if (selectedStep === 1) return "0%";
    return `${(selectedStep - 1) * 19}%`;
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(products.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const stepCategories = {
    1: ["CTG00002"], // Cleanser
    2: ["CTG00010", "CTG00012"], // Eye cream, Eye Serum
    3: ["CTG00004"], // Toner
    4: ["CTG00005", "CTG00006", "CTG00007"], // Serum
    5: ["CTG00008"], // Moisturizer
    6: ["CTG00009"], // Sunscreen
  };

  const filterProductsByStep = (products, step) => {
    const catIds = stepCategories[step] || [];
    return products.filter((product) => catIds.includes(product.category_id?.trim()));
  };

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/product/api_product?_=${timestamp}`);
      const data = await response.json();

      const stepNum = parseInt(router.query.order);
      const stepToUse = !isNaN(stepNum) ? stepNum : selectedStep;

      if (data.mysqlData && Array.isArray(data.mysqlData)) {
        setAllProducts(data.mysqlData);

        const filtered = filterProductsByStep(data.mysqlData, stepToUse);

        const final = searchQuery
          ? filtered.filter((p) =>
            p.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          : filtered;

        setProducts(final);

        const nameMap = {};
        data.mysqlData.forEach((product) => {
          nameMap[product.pd_id] = product.name;
        });
        setProductNameMap(nameMap);

        setCurrentPage(1);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Error fetching product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveStepProduct = ({ stepOrder, pdid }) => {
    setSelectedProducts((prev) => [...prev, { stepOrder, pdid }]);
  };

  const showSummaryModal = () => {
    setShowModal(true);
  };

  const updateRoutineSet = async () => {
    const dataToSend = {
      routine_id: routineIdFromQuery,
      steps: selectedProducts,
    };

    try {
      const res = await fetch('/api/routine/api_editRoutineSet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) throw new Error("Failed to update routine");

      alert("Routine updated!");
      router.push("/routineSet/createRoutine");
    } catch (err) {
      console.error("Error updating routine:", err);
      alert("Could not update routine.");
    }
  };

  const saveRoutineSet = async () => {
    if (!routineName.trim()) {
      alert("Please enter a name for your routine.");
      return;
    }

    try {
      // 1. Save routine info first
      const routineRes = await fetch('/api/routine/api_routineSet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accid: localStorage.getItem("user_acc_id"),
          routineType: 'Morning',
          routineName: routineName,
          steps: selectedProducts,
        }),
      });

      if (!routineRes.ok) throw new Error("Failed to save routine set");

      const routineData = await routineRes.json();
      const routine_id = routineData?.routine_id;

      if (!routine_id) {
        throw new Error("Routine ID is missing after creation.");
      }

      alert("Routine saved successfully!");
      setShowModal(false);
      setRoutineName("");
      setSelectedStep(1);
      router.push("/routineSet/createRoutine");

    } catch (err) {
      console.error("❌ Error saving routine:", err);
      alert("Error saving routine. " + err.message);
    }
  };

  const removeStepProduct = (stepOrder) => {
    setSelectedProducts(prev =>
      prev.filter(item => item.stepOrder !== stepOrder)
    );

    alert("Product has been removed from this step.");
  };

  useEffect(() => {
    if (!router.isReady) return;
    const stepNum = parseInt(router.query.order) || 1;
    setSelectedStep(stepNum);
    fetchProducts();
  }, [router.isReady, router.query.order]);

  useEffect(() => {
    if (router.query.routine_id) {
      setRoutineIdFromQuery(router.query.routine_id);
    }
  }, [router.query.routine_id]);

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
            <h2>My Routine Set</h2>

            <div className={styles.rowStepWithArrow}>
              <button className={styles.arrowButton} disabled={selectedStep === 1}
                onClick={() => {
                  const prevStep = selectedStep - 1;

                  // 🧭 Update state and URL
                  setSelectedStep(prevStep);
                  setSearchQuery("");

                  router.push(
                    {
                      pathname: router.pathname,
                      query: { ...router.query, order: prevStep },
                    },
                    undefined,
                    { shallow: true }
                  );
                }}>
                ◀
              </button>

              <div className={styles.rowStep}>
                <div className={styles.line} style={{ width: getLineWidth() }}></div>

                {/* Steps 1 to 6 */}
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div
                    key={step}
                    className={styles.nextStep}
                    onClick={() => goToStep(step)} 
                    style={{ cursor: "pointer" }}>
                    <div className={selectedStep >= step ? styles.circle : styles.whNext}>
                      <div className={selectedStep >= step ? styles.whiteCircle : styles.whiteCirclePlus}>
                        <h4 className="stepNumber">{`0${step}`}</h4>
                      </div>
                    </div>
                    <h4>
                      {
                        step === 1 ? "Cleanser" :
                          step === 2 ? "Eye cream" :
                            step === 3 ? "Toner" :
                              step === 4 ? "Serum" :
                                step === 5 ? "Moisturizer" : "Sun Screen"
                      }
                    </h4>
                  </div>
                ))}
              </div>

              <button className={styles.arrowButton}
                onClick={() => {
                  const nextStep = selectedStep + 1;

                  if (selectedStep >= 6) {
                    showSummaryModal();
                  } else {
                    setSelectedStep(nextStep);

                    router.push(
                      {
                        pathname: router.pathname,
                        query: { ...router.query, order: nextStep },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }
                }}>
                ▶
              </button>
            </div>
          </div>

          {/* Head Morning Set */}
          <div className={styles.settext}>
            <h3> Morning Set </h3>
            <img src="/image/sun.png" alt="sunIcon" style={{ width: '30px', height: '30px', marginLeft: '6px' }} />
          </div>
          <p className={styles.miniStepOrder}>Step {selectedStep}</p>

          {/* Selected Product */}
          <div className={styles.selectedProduct}>
            {selectedProducts.some(p => p.stepOrder === selectedStep) ? (
              (() => {
                const selected = selectedProducts.find(p => p.stepOrder === selectedStep);
                const productName = productNameMap[selected.pdid] || "Unnamed Product";
                const imagePath = `/image/ProductImage/${selected.pdid}.jpg`;
                return (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Link href={`/productInfo?pdid=${selected.pdid}`}>
                      <img src={imagePath} alt={productName}
                        style={{ width: '80px', height: '80px', marginRight: '10px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/image/ProductImage/notfoundProduct.jpg";
                        }} />
                    </Link>
                    <div>
                      <p>✅ Selected: {productName}</p>
                      <button
                        onClick={() => removeStepProduct(selectedStep)}
                        style={{ color: "red", marginTop: "5px" }}>
                        ❌ Remove
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className={styles.textPlaceholder}>No product selected for this step.</p>
            )}
          </div>

          {/* Search */}
          <div className={styles.searchBox}>
            <input type="text" placeholder="Search" value={searchQuery} onChange={handleSearch} />
            <button onClick={handleSearchSubmit}>
              <img src="/image/search.png" alt="search" style={{ width: '30px', height: '30px' }} />
            </button>
          </div>

          {/* Product List */}
          <div className={styles.productList}>
            {loading ? (
              <p>Loading products...</p>
            ) : currentProducts && currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <div key={product.pd_id} className={styles.productItem}>
                  <Link href={`/productInfo?pdid=${product.pd_id}`}>
                    <img
                      src={product?.photo || `/image/ProductImage/${product.pd_id}.jpeg`}
                      alt="product"
                      style={{ width: '80px', height: '80px' }}
                    />
                  </Link>

                  <div className={styles.productInfo}>
                    <Link href={`/productInfo?pdid=${product.pd_id}`}>
                      <h5>{product.name || "No Name Available"}</h5>
                      <p>{product.description || "No Description Available"}</p>
                    </Link>
                  </div>

                  {/* Add Button */}
                  <button disabled={isSaving} onClick={async () => {

                    // Prevent duplicate step entries in new routines
                    if (!isEditMode && selectedProducts.some(item => item.stepOrder === selectedStep)) {
                      alert("You can only add one product per step.");
                      return;
                    }

                    // Adding new step from routine detail (popup confirm)
                    if (!isEditMode && !stepid && routine_id) {
                      setPendingProduct({ pdid: product.pd_id, stepOrder: selectedStep, mode: "add" });
                      setConfirmModal(true);
                      return;
                    }

                    // add product through Routine Set Detail
                    if (!isEditMode && stepid) {
                      saveStepProduct({
                        pdid: product.pd_id,
                        stepOrder: selectedStep,
                        routine_id: routineIdFromQuery,
                      });
                      return;
                    }

                    // Editing existing step (popup confirm)
                    if (isEditMode && stepid) {
                      setPendingProduct({ pdid: product.pd_id, mode: "edit" });
                      setConfirmModal(true);
                      return;
                    }

                    if (!isEditMode && !stepid) {
                      const nextStep = selectedStep + 1;
                      saveStepProduct({
                        pdid: product.pd_id,
                        stepOrder: selectedStep,
                        routine_id: routineIdFromQuery,
                      });

                      if (nextStep > 6) {
                        showSummaryModal();
                      } else {
                        setSelectedStep(nextStep);
                        router.push({
                          pathname: router.pathname,
                          query: { ...router.query, order: nextStep },
                        }, undefined, { shallow: true });
                      }
                    }

                    setIsSaving(false);
                  }}>
                    <svg width="12" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.9286 8.57143H8.57143V13.9286C8.57143 14.2127 8.45855 14.4853 8.25761 14.6862C8.05668 14.8871 7.78416 15 7.5 15C7.21584 15 6.94332 14.8871 6.74239 14.6862C6.54145 14.4853 6.42857 14.2127 6.42857 13.9286V8.57143H1.07143C0.787268 8.57143 0.514746 8.45855 0.313814 8.25762C0.112883 8.05668 0 7.78416 0 7.5C0 7.21584 0.112883 6.94332 0.313814 6.74239C0.514746 6.54145 0.787268 6.42857 1.07143 6.42857H6.42857V1.07143C6.42857 0.787268 6.54145 0.514746 6.74239 0.313814C6.94332 0.112882 7.21584 0 7.5 0C7.78416 0 8.05668 0.112882 8.25761 0.313814C8.45855 0.514746 8.57143 0.787268 8.57143 1.07143V6.42857H13.9286C14.2127 6.42857 14.4853 6.54145 14.6862 6.74239C14.8871 6.94332 15 7.21584 15 7.5C15 7.78416 14.8871 8.05668 14.6862 8.25762C14.4853 8.45855 14.2127 8.57143 13.9286 8.57143Z" fill="black" />
                    </svg>
                    Add
                  </button>
                </div>
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>

          {/* button next page */}
          <div className={styles.nextpage}>
            <span className={styles.page}> Page {currentPage} of {Math.ceil(products.length / itemsPerPage)} </span>

            <div className={styles.movePages}>
              <div className={styles.Move}>
                <button onClick={handlePrevPage} disabled={currentPage === 1}> Prev </button>
              </div>

              <div className={styles.Move}>
                <button onClick={handleNextPage} disabled={currentPage === Math.ceil(products.length / itemsPerPage)}> Next </button>
              </div>
            </div>
          </div>

          {showModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3>🧴 Your Routine Summary</h3>
                <ul>
                  {Array.isArray(selectedProducts) && selectedProducts.length > 0 ? (
                    selectedProducts
                      .sort((a, b) => a.stepOrder - b.stepOrder)
                      .map((item, i) => (
                        <li key={i}>
                          Step {item.stepOrder}: {productNameMap[item.pdid] || item.pdid}
                          <button className={styles.removeState} onClick={() => removeStepProduct(item.stepOrder)}
                            style={{ marginLeft: "10px", color: "red" }}>
                            ❌ Remove
                          </button>
                        </li>
                      ))
                  ) : (
                    <li>No selected products</li>
                  )}
                </ul>

                {!isEditMode && (
                  <input type="text" placeholder="Enter routine name" value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)} />
                )}

                <button onClick={isEditMode ? updateRoutineSet : saveRoutineSet}>
                  Save Routine
                </button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          )}

          {confirmModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>

                {/* edit routine */}
                {pendingProduct?.mode === "edit" ? (
                  <div>
                    <h4>🔁 Confirm Product Change</h4>
                    <p>Do you want to replace the product in this step?</p>
                    <button onClick={async () => {
                      try {

                        if (!routineIdFromQuery) {
                          alert("Routine ID not ready.");
                          return;
                        }

                        const res = await fetch('/api/routine/api_editRoutineStep', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            stepid, 
                            pdid: pendingProduct.pdid,
                          }),
                        });

                        if (!res.ok) throw new Error("Failed to update step");
                        alert("✅ Step updated!");
                        router.push(`/routineSet/morningRoutineDetail?routine_id=${routine_id}`);
                      } catch (err) {
                        alert("❌ Error updating step");
                        console.error(err);
                      } finally {
                        setConfirmModal(false);
                      }
                    }}>Yes, Replace</button>
                  </div>
                ) : (
                  <>
                    {/* add product in routine */}
                    <h4>➕ Confirm Add</h4>
                    <p>Do you want to add this product to Step {pendingProduct?.stepOrder}?</p>
                    <button onClick={async () => {
                      try {
                        const res = await fetch('/api/routine/api_step', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            stepOrder: pendingProduct.stepOrder,
                            pdid: pendingProduct.pdid,
                            routine_id: routineIdFromQuery,
                          }),
                        });
                        if (!res.ok) throw new Error("Failed to add step");
                        alert("✅ Step added!");
                        router.push(`/routineSet/morningRoutineDetail?routine_id=${routineIdFromQuery}`);
                      }
                      catch (err) {
                        alert("❌ Error adding step");
                        console.error(err);
                      }
                      finally {
                        setConfirmModal(false);
                      }
                    }}>Yes, Add</button>
                  </>
                )}
                <button onClick={() => setConfirmModal(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}