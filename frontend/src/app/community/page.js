"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./community.module.css";

const CATEGORIES = ["Furniture", "Decor", "Accessories", "Clothing", "Tools", "Other"];
const BARANGAYS = [
  "West Bajac-Bajac",
  "New Kababae",
  "New Ilalim",
  "West Tapinac",
  "New Banicain",
  "Barretto",
  "Kalaklan",
  "East Bajac-Bajac",
  "East Tapinac",
  "Kalalake",
  "New Asinan",
  "Pag-asa",
  "Mabayuan",
  "Sta. Rita",
  "Gordon Heights",
  "Old Cabalan",
  "New Cabalan",
];

export default function CommunityPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [listings, setListings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [contactNumber, setContactNumber] = useState("");
  const [barangay, setBarangay] = useState(BARANGAYS[0]);
  const [userName, setUserName] = useState("");
  const [image, setImage] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [openComments, setOpenComments] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("new");
  const [commentNames, setCommentNames] = useState({});
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(100); // default ₱100
  const [datePosted, setDatePosted] = useState("any");
  const [filterBarangay, setFilterBarangay] = useState("All");

  useEffect(() => {
    const onResize = () => setIsMobile(typeof window !== "undefined" && window.innerWidth <= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("marketListings");
      if (raw) setListings(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("marketListings", JSON.stringify(listings));
    } catch {}
  }, [listings]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory(CATEGORIES[0]);
    setContactNumber("");
    setBarangay(BARANGAYS[0]);
    setUserName("");
    setImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = Number(price);
    if (!name || !description || Number.isNaN(p) || p < 0 || !category) return;
    if (editingId) {
      setListings((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? {
                ...it,
                name,
                description,
                price: p,
                category,
                contactNumber,
                barangay,
                userName: userName || it.userName || "User",
                image,
              }
            : it
        )
      );
    } else {
      const item = {
        id: `${Date.now()}`,
        name,
        description,
        price: p,
        category,
        contactNumber,
        barangay,
        userName: userName || "User",
        image,
        likes: 0,
        comments: [],
        createdAt: Date.now(),
      };
      setListings((prev) => [item, ...prev]);
    }
    setShowModal(false);
  };
  const handleEdit = (it) => {
    setEditingId(it.id);
    setName(it.name);
    setDescription(it.description);
    setPrice(String(it.price));
    setCategory(it.category);
    setContactNumber(it.contactNumber || "");
    setBarangay(it.barangay || BARANGAYS[0]);
    setUserName(it.userName || "");
    setImage(it.image || null);
    setShowModal(true);
  };
  const handleDelete = (id) => {
    setListings((prev) => prev.filter((x) => x.id !== id));
  };
  const handleLike = (id) => {
    setListings((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, liked: !x.liked, likes: x.liked ? x.likes - 1 : x.likes + 1 } : x
      )
    );
  };
  const toggleComments = (id) => {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const handleCommentDraft = (id, text) => {
    setCommentDrafts((d) => ({ ...d, [id]: text }));
  };
  const handleAddComment = (id) => {
    const text = (commentDrafts[id] || "").trim();
    const userName = (commentNames[id] || "").trim() || "User";
    if (!text) return;
    setListings((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              comments: [
                ...x.comments,
                { id: `${id}-${Date.now()}`, text, userName, date: new Date().toISOString() },
              ],
            }
          : x
      )
    );
    setCommentDrafts((d) => ({ ...d, [id]: "" }));
    setCommentNames((d) => ({ ...d, [id]: "" }));
    setOpenComments((s) => new Set(s).add(id));
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);
  const isHttp = (v) => /^https?:\/\//i.test(v);
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory(CATEGORIES[0]);
    setContactNumber("");
    setBarangay(BARANGAYS[0]);
    setUserName("");
    setImage(null);
    setShowModal(true);
  };

  const filteredListings = useMemo(() => {
    let arr = [...listings];
    const q = search.trim().toLowerCase();
    if (q) {
      arr = arr.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.description.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== "All") {
      arr = arr.filter((x) => x.category === activeCategory);
    }
    if (filterBarangay !== "All") {
      arr = arr.filter((x) => (x.barangay || "") === filterBarangay);
    }
    arr = arr.filter((x) => x.price >= priceMin && (priceMax >= 1000 ? true : x.price <= priceMax));
    if (datePosted !== "any") {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      let since = 0;
      if (datePosted === "today") since = now - oneDay;
      if (datePosted === "week") since = now - 7 * oneDay;
      if (datePosted === "month") since = now - 30 * oneDay;
      if (since) arr = arr.filter((x) => x.createdAt >= since);
    }
    if (sortBy === "likes") {
      arr.sort((a, b) => (b.likes - a.likes) || (b.createdAt - a.createdAt));
    } else if (sortBy === "price-asc") {
      arr.sort((a, b) => (a.price - b.price) || (b.createdAt - a.createdAt));
    } else if (sortBy === "price-desc") {
      arr.sort((a, b) => (b.price - a.price) || (b.createdAt - a.createdAt));
    } else {
      arr.sort((a, b) => b.createdAt - a.createdAt);
    }
    return arr;
  }, [listings, activeCategory, filterBarangay, search, sortBy, priceMin, priceMax, datePosted]);
  const trends = useMemo(() => {
    const map = new Map();
    listings.forEach((x) => map.set(x.category, (map.get(x.category) || 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [listings]);
  const getInitials = (s) =>
    (s || "User")
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const handleClearFilters = () => {
    setActiveCategory("All");
    setPriceMax(100); 
    setDatePosted("any");
    setFilterBarangay("All");
  };

  // Show Filters button whenever the left rail is hidden by CSS (<= 1024px)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.pageLabel}>Community</h1>
        <p className={styles.pageDesc}>Buy, sell, and share upcycled goods</p>
      </header>
      <div className={styles.container}>
        <aside className={styles.leftRail}>
          <div className={styles.railCard}>
            <div className={styles.railTitle}>Filters</div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="category">Category</label>
              <div className={styles.selectWrap}>
                <select
                  id="category"
                  className={styles.select}
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  <option value="All">All</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="filterBarangay">Location</label>
              <div className={styles.selectWrap}>
                <select
                  id="filterBarangay"
                  className={styles.select}
                  value={filterBarangay}
                  onChange={(e) => setFilterBarangay(e.target.value)}
                >
                  <option value="All">All</option>
                  {BARANGAYS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Price Range</label>
              <div className={styles.rangeValues}>
                <span>₱0</span>
                <span>₱{priceMax >= 1000 ? "1,000+" : priceMax}</span>
              </div>
              <input
                className={styles.range}
                type="range"
                min={0}
                max={1000}
                step={50}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="datePosted">Date Posted</label>
              <div className={styles.selectWrap}>
                <select
                  id="datePosted"
                  className={styles.select}
                  value={datePosted}
                  onChange={(e) => setDatePosted(e.target.value)}
                >
                  <option value="any">Any time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>
              </div>
            </div>
            <div className={styles.filterActions}>
              <button
                type="button"
                className={styles.buttonPrimary}
                onClick={() => {}}
              >
                Apply Filters
              </button>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className={`${styles.railCard} ${styles.trendingCard}`}>
            <div className={styles.railTitle}>Trending Categories</div>
            <ul className={styles.trendList}>
              {trends.length === 0 && <li className={styles.trendEmpty}>No trends yet</li>}
              {trends.length > 0 &&
                trends.map(([cat, count]) => (
                  <li key={cat} className={styles.trendItem}>
                    <span>{cat}</span>
                    <span className={styles.trendCount}>{count}</span>
                  </li>
                ))}
            </ul>
          </div>
        </aside>

        <section className={styles.centerColumn}>
          <div className={styles.actionsRow} style={{ justifyContent: "flex-start" }}>
            <button type="button" className={styles.buttonPrimary} onClick={openCreateModal}>
              <i className="fas fa-plus" aria-hidden="true" />
              <strong>Create New Listing</strong>
            </button>
            {isMobile && (
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => setShowFilterModal(true)}
              >
                <i className="fas fa-sliders-h" aria-hidden="true" />
                Filters
              </button>
            )}
          </div>

          {showModal && (
            <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label={editingId ? "Edit listing" : "Create listing"}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <div className={styles.modalTitle}>{editingId ? "Edit your listing" : "Create a new listing"}</div>
                  <button type="button" className={styles.ghostBtn} onClick={() => setShowModal(false)}>
                    <i className="fas fa-times" aria-hidden="true" /> Close
                  </button>
                </div>
                <form className={styles.modalBody} onSubmit={handleSubmit}>
                  <div className={styles.composerRow}>
                    <div className={styles.formField}>
                      <label className={styles.inputLabel} htmlFor="productName">Product name</label>
                      <input id="productName" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.inputLabel} htmlFor="priceInput">Price</label>
                      <input id="priceInput" className={styles.input} type="number" inputMode="decimal" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.inputLabel} htmlFor="categorySelect">Category</label>
                      <div className={styles.selectWrap}>
                        <select id="categorySelect" className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                          {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className={styles.composerRow}>
                    <div className={styles.formField}>
                      <label className={styles.inputLabel} htmlFor="contactNumber">Contact number</label>
                      <input id="contactNumber" className={styles.input} value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.inputLabel} htmlFor="barangaySelect">Barangay</label>
                      <div className={styles.selectWrap}>
                        <select id="barangaySelect" className={`${styles.select} ${styles.barangaySelect}`} value={barangay} onChange={(e) => setBarangay(e.target.value)}>
                          {BARANGAYS.map((b) => (<option key={b} value={b}>{b}</option>))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.inputLabel} htmlFor="description">Description</label>
                    <textarea id="description" className={styles.textarea} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                   <div className={styles.mediaRow}>
                    <label className={styles.uploadBtn}>
                       <i className="fas fa-image" aria-hidden="true" />
                       Add Image
                       <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
                     </label>
                     {image && (
                       <div className={styles.previewWrap}>
                         <img src={image} alt="Preview" className={styles.previewImg} />
                         <button type="button" className={styles.previewRemove} onClick={() => setImage(null)}>
                           <i className="fas fa-times" aria-hidden="true" /> Remove
                         </button>
                       </div>
                     )}
                   </div>
                  <div className={styles.modalActions}>
                    <button type="submit" className={styles.buttonPrimary}>
                      <i className="fas fa-paper-plane" aria-hidden="true" />
                      {editingId ? "Save" : "Post"}
                    </button>
                    <button type="button" className={styles.buttonSecondary} onClick={() => setShowModal(false)}>
                      <i className="fas fa-times" aria-hidden="true" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isMobile && showFilterModal && (
            <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Filters">
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <div className={styles.modalTitle}>Filters</div>
                  <button type="button" className={styles.ghostBtn} onClick={() => setShowFilterModal(false)}>
                    <i className="fas fa-times" aria-hidden="true" /> Close
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="m-category">Category</label>
                    <div className={styles.selectWrap}>
                      <select
                        id="m-category"
                        className={styles.select}
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                      >
                        <option value="All">All</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="m-filterBarangay">Location</label>
                    <div className={styles.selectWrap}>
                      <select
                        id="m-filterBarangay"
                        className={styles.select}
                        value={filterBarangay}
                        onChange={(e) => setFilterBarangay(e.target.value)}
                      >
                        <option value="All">All</option>
                        {BARANGAYS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Price Range</label>
                    <div className={styles.rangeValues}>
                      <span>₱0</span>
                      <span>₱{priceMax >= 1000 ? "1,000+" : priceMax}</span>
                    </div>
                    <input
                      className={styles.range}
                      type="range"
                      min={0}
                      max={1000}
                      step={50}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                    />
                  </div>
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel} htmlFor="m-datePosted">Date Posted</label>
                    <div className={styles.selectWrap}>
                      <select
                        id="m-datePosted"
                        className={styles.select}
                        value={datePosted}
                        onChange={(e) => setDatePosted(e.target.value)}
                      >
                        <option value="any">Any time</option>
                        <option value="today">Today</option>
                        <option value="week">This week</option>
                        <option value="month">This month</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.buttonPrimary} onClick={() => setShowFilterModal(false)}>
                    Apply Filters
                  </button>
                  <button type="button" className={styles.buttonSecondary} onClick={() => { handleClearFilters(); setShowFilterModal(false); }}>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.feedContainer}>
            <div className={styles.feedToolbar}>
              <div className={styles.feedTitle}>Community Listings</div>
              <div className={styles.toolbarRight}>
                <span className={styles.sortLabel}>Sort</span>
                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="new">Newest</option>
                  <option value="likes">Most Liked</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
            <ul className={styles.feed}>
              {filteredListings.map((it) => (
                <li key={it.id} className={styles.post}>
                  <div className={styles.postHeader}>
                    <div className={styles.postMeta}>
                      <div className={styles.userRow}>
                        <div className={styles.avatar}>WW</div>
                        <span className={styles.postUser}>{it.userName || "User"}</span>
                      </div>
                      <div className={styles.postTitle}>
                        {it.name}
                        <span className={styles.price}>{formatCurrency(it.price)}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <span className={styles.categoryPill}>{it.category}</span>
                        {it.barangay && <span className={styles.categoryPill}>{it.barangay}</span>}
                        <span className={styles.dateText}>
                          <i className="far fa-clock" aria-hidden="true" /> {new Date(it.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className={styles.actionRight}>
                      <button type="button" className={styles.ghostBtn} onClick={() => handleEdit(it)}>
                        <i className="fas fa-edit" aria-hidden="true" />
                        Edit
                      </button>
                      <button type="button" className={styles.dangerBtn} onClick={() => handleDelete(it.id)}>
                        <i className="fas fa-trash" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className={styles.postBody}>
                    <p className={styles.postDesc}>{it.description}</p>
                  </div>
                  {it.image && (
                    <div className={styles.postMedia}>
                      <img src={it.image} alt={it.name} className={styles.postImage} />
                    </div>
                  )}

                  <div className={styles.postActions}>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${it.liked ? styles.liked : ""}`}
                      onClick={() => handleLike(it.id)}
                    >
                      <i className="fas fa-heart" aria-hidden="true" />
                      <span>{it.likes}</span>
                    </button>
                    <button type="button" className={styles.iconBtn} onClick={() => toggleComments(it.id)}>
                      <i className="fas fa-comment" aria-hidden="true" />
                      <span>{it.comments.length}</span>
                    </button>
                  </div>
                  {openComments.has(it.id) && (
                    <div className={styles.comments}>
                      <ul className={styles.commentList}>
                        {it.comments.map((c) => (
                          <li key={c.id} className={styles.commentItem}>
                            <div className={styles.commentAvatar}>{getInitials(c.userName)}</div>
                            <div className={styles.commentContent}>
                              <div className={styles.commentTop}>
                                <span className={styles.commentUser}>{c.userName || "User"}</span>
                                <span className={styles.commentDate}>{new Date(c.date).toLocaleString()}</span>
                              </div>
                              <div className={styles.commentText}>{c.text}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className={styles.commentForm}>
                        <input
                          className={styles.commentInput}
                          value={commentDrafts[it.id] || ""}
                          onChange={(e) => handleCommentDraft(it.id, e.target.value)}
                          placeholder="Write a comment"
                        />
                        <button type="button" className={styles.buttonSmall} onClick={() => handleAddComment(it.id)}>
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>

    </main>
  );
}
