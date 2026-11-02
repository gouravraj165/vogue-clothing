
import { useEffect, useState } from "react";
import "./App.css";
import ContactPage from "./contactpage";

const API_URL = "http://localhost:5000/api/auth";
const ORDERS_API_URL = "http://localhost:5000/api/orders";

const products = [
  { id: 1, name: "Classic Black Jacket", category: "Men", price: 2199, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700" },
  { id: 2, name: "Elegant Women Dress", category: "Women", price: 1799, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=700" },
  { id: 3, name: "Premium White Shirt", category: "Men", price: 999, image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=700" },
  { id: 4, name: "Luxury Handbag", category: "Accessories", price: 1499, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700" },
  { id: 5, name: "Casual Denim Outfit", category: "Women", price: 1899, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700" },
  { id: 6, name: "Classic Sneakers", category: "Accessories", price: 1299, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700" },
  { id: 7, name: "Men's Casual Wear", category: "Men", price: 1599, image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=700" },
  { id: 8, name: "Stylish Women Top", category: "Women", price: 799, image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=700" }
];

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled"
];

function App() {
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("vogueCart") || "[]")
  );

  const [wishlist, setWishlist] = useState(() =>
    JSON.parse(localStorage.getItem("vogueWishlist") || "[]")
  );

  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [lightOn, setLightOn] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("vogueUser") || "null")
  );

  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState(false);

  // Checkout states
  const [showCheckout, setShowCheckout] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  // Customer orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Admin states
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState("");

  useEffect(() => {
    localStorage.setItem("vogueCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("vogueWishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const shippingCharge = total >= 1999 ? 0 : 99;
  const finalTotal = total + shippingCharge;

  const formatPrice = (amount) =>
    Number(amount || 0).toLocaleString("en-IN");

  const statusColor = (status) => {
    if (status === "Delivered") return "#4ade80";
    if (status === "Cancelled") return "#ff7070";
    if (status === "Shipped") return "#60a5fa";
    if (status === "Confirmed") return "#a78bfa";
    return "#d4af37";
  };

  const addToCart = (product) => {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...previous, { ...product, qty: 1 }];
    });
  };

  const changeQty = (id, amount) => {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + amount } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((previous) => previous.filter((item) => item.id !== id));
  };

  const toggleWishlist = (product) => {
    setWishlist((previous) =>
      previous.some((item) => item.id === product.id)
        ? previous.filter((item) => item.id !== product.id)
        : [...previous, product]
    );
  };

  const openLogin = () => {
    setLightOn(false);
    setAuthMode("login");
    setAuthMessage("");
    setAuthError(false);
    setName("");
    setEmail("");
    setPassword("");
    setShowLogin(true);
  };

  const switchAuthMode = () => {
    setAuthMode((previous) =>
      previous === "login" ? "signup" : "login"
    );
    setAuthMessage("");
    setAuthError(false);
    setPassword("");
  };

  // Login and Signup
  const handleAuth = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setAuthMessage("");
    setAuthError(false);

    const endpoint = authMode === "login" ? "/login" : "/signup";

    const body =
      authMode === "login"
        ? { email, password }
        : { name, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong");
      }

      if (authMode === "signup") {
        setAuthMessage("Account created! Please login now.");
        setAuthError(false);
        setAuthMode("login");
        setName("");
        setPassword("");
      } else {
        localStorage.setItem("vogueToken", data.token);
        localStorage.setItem("vogueUser", JSON.stringify(data.user));

        setUser(data.user);
        setShowLogin(false);
        setPassword("");
        setAuthMessage("");

        alert(`Welcome to VOGUE, ${data.user.name}!`);
      }
    } catch (error) {
      setAuthMessage(
        error.message === "Failed to fetch"
          ? "Backend server is not running. Please try again."
          : error.message
      );
      setAuthError(true);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("vogueToken");
    localStorage.removeItem("vogueUser");

    setUser(null);
    setOrders([]);
    setAdminOrders([]);
    setSelectedOrder(null);
    setPage("home");

    alert("You have been logged out successfully.");
  };

  // Checkout
  const openCheckout = () => {
    if (!user) {
      alert("Please login before placing your order.");
      openLogin();
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setPlacedOrder(null);
    setOrderMessage("");
    setShowCheckout(true);

    setShippingAddress((previous) => ({
      ...previous,
      fullName: previous.fullName || user.name || ""
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setShippingAddress((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Place order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (placingOrder) return;

    const token = localStorage.getItem("vogueToken");

    if (!token) {
      setOrderMessage("Please login again before placing your order.");
      return;
    }

    setPlacingOrder(true);
    setOrderMessage("");

    try {
      const orderItems = cart.map((item) => ({
        productId: String(item.id),
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.qty),
        image: item.image
      }));

      const response = await fetch(ORDERS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress,
          paymentMethod: "COD"
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to place order");
      }

      setPlacedOrder(data.order);
      setShowCheckout(false);
      setCart([]);
      setOrderMessage("");

    } catch (error) {
      setOrderMessage(
        error.message === "Failed to fetch"
          ? "Backend server is not running. Please try again."
          : error.message
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // Fetch customer orders
  const fetchMyOrders = async () => {
    const token = localStorage.getItem("vogueToken");

    if (!token) {
      setOrdersError("Please login to view your orders.");
      return;
    }

    setOrdersLoading(true);
    setOrdersError("");

    try {
      const response = await fetch(`${ORDERS_API_URL}/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch orders.");
      }

      setOrders(data.orders || []);
    } catch (error) {
      setOrdersError(
        error.message === "Failed to fetch"
          ? "Backend server is not running."
          : error.message
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const openMyOrders = () => {
    if (!user) {
      alert("Please login to view your orders.");
      openLogin();
      return;
    }

    setSelectedOrder(null);
    setPage("orders");
    fetchMyOrders();
  };

  // ADMIN: Fetch all orders
  const fetchAdminOrders = async () => {
    const token = localStorage.getItem("vogueToken");

    if (!token) {
      setAdminError("Please login again.");
      return;
    }

    setAdminLoading(true);
    setAdminError("");

    try {
      const response = await fetch(`${ORDERS_API_URL}/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch admin orders.");
      }

      setAdminOrders(data.orders || []);
    } catch (error) {
      setAdminError(
        error.message === "Failed to fetch"
          ? "Backend server is not running."
          : error.message
      );
    } finally {
      setAdminLoading(false);
    }
  };

  // ADMIN: Open dashboard
  const openAdminPanel = () => {
    if (!user || user.role !== "admin") {
      alert("Admin access denied.");
      return;
    }

    setPage("admin");
    fetchAdminOrders();
  };

  // ADMIN: Update order status
  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem("vogueToken");

    if (!token) {
      alert("Please login again.");
      return;
    }

    setUpdatingOrder(orderId);

    try {
      const response = await fetch(
        `${ORDERS_API_URL}/admin/${encodeURIComponent(orderId)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Status update failed.");
      }

      setAdminOrders((previous) =>
        previous.map((order) =>
          order.orderId === orderId ? data.order : order
        )
      );

      alert("Order status updated successfully!");
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdatingOrder("");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "All" || product.category === category;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Product cards
  const ProductList = ({ items }) => (
    <div className="product-grid">
      {items.length === 0 ? (
        <p className="empty-message">No products found.</p>
      ) : (
        items.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image-wrap">
              <img src={product.image} alt={product.name} />

              <button
                className={`wishlist-btn ${
                  wishlist.some((item) => item.id === product.id)
                    ? "saved"
                    : ""
                }`}
                onClick={() => toggleWishlist(product)}
              >
                {wishlist.some((item) => item.id === product.id)
                  ? "♥"
                  : "♡"}
              </button>

              <span className="product-tag">VOGUE EDIT</span>
            </div>

            <div className="product-info">
              <p className="product-category">{product.category}</p>
              <h3>{product.name}</h3>
              <strong>₹{formatPrice(product.price)}</strong>

              <button
                className="add-btn"
                onClick={() => addToCart(product)}
              >
                ADD TO CART +
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Order details component
  const OrderDetails = ({ order, onBack, admin = false }) => (
    <div
      style={{
        maxWidth: "850px",
        margin: "30px auto",
        padding: "25px",
        border: "1px solid #d4af37",
        borderRadius: "12px"
      }}
    >
      <button
        className="primary-btn"
        onClick={onBack}
        style={{ marginBottom: "20px" }}
      >
        ← BACK
      </button>

      <h2 style={{ color: "#d4af37" }}>Order Details</h2>

      <p style={{ marginTop: "15px", overflowWrap: "anywhere" }}>
        <strong>Order ID:</strong> {order.orderId}
      </p>

      <p>
        <strong>Order Date:</strong>{" "}
        {new Date(order.createdAt).toLocaleString("en-IN")}
      </p>

      <p>
        <strong>Order Status:</strong>{" "}
        <span style={{ color: statusColor(order.orderStatus) }}>
          {order.orderStatus}
        </span>
      </p>

      <p>
        <strong>Payment:</strong>{" "}
        {order.paymentMethod === "COD"
          ? "Cash on Delivery"
          : order.paymentMethod}
      </p>

      <p>
        <strong>Payment Status:</strong> {order.paymentStatus}
      </p>

      {admin && (
        <>
          <p>
            <strong>Customer:</strong>{" "}
            {order.userId?.name || "Customer"}
          </p>
          <p>
            <strong>Email:</strong> {order.userId?.email || "N/A"}
          </p>
        </>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h3>Ordered Products</h3>

      {order.items?.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            padding: "15px 0",
            borderBottom: "1px solid #555"
          }}
        >
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "75px",
                height: "85px",
                objectFit: "cover",
                borderRadius: "6px"
              }}
            />
          )}

          <div>
            <h4>{item.name}</h4>
            <p>Quantity: {item.quantity}</p>
            <p>Price: ₹{formatPrice(item.price)}</p>
            <p>
              Item Total: ₹
              {formatPrice(Number(item.price) * Number(item.quantity))}
            </p>
          </div>
        </div>
      ))}

      <h3 style={{ marginTop: "20px", color: "#d4af37" }}>
        Total: ₹{formatPrice(order.totalAmount)}
      </h3>

      <hr style={{ margin: "20px 0" }} />

      <h3>Delivery Address</h3>
      <p>{order.shippingAddress?.fullName}</p>
      <p>{order.shippingAddress?.phone}</p>
      <p>{order.shippingAddress?.address}</p>
      <p>
        {order.shippingAddress?.city},{" "}
        {order.shippingAddress?.state} -{" "}
        {order.shippingAddress?.pincode}
      </p>
    </div>
  );

  // Admin dashboard calculations
  const adminSales = adminOrders.reduce(
    (sum, order) =>
      order.orderStatus !== "Cancelled"
        ? sum + Number(order.totalAmount || 0)
        : sum,
    0
  );

  const pendingCount = adminOrders.filter(
    (order) => order.orderStatus === "Pending"
  ).length;

  const confirmedCount = adminOrders.filter(
    (order) => order.orderStatus === "Confirmed"
  ).length;

  const shippedCount = adminOrders.filter(
    (order) => order.orderStatus === "Shipped"
  ).length;

  const deliveredCount = adminOrders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;

  const cancelledCount = adminOrders.filter(
    (order) => order.orderStatus === "Cancelled"
  ).length;

  return (
    <div className="app">
      <div className="top-strip">
        ✦ FREE SHIPPING ON ORDERS ABOVE ₹1999 ✦
      </div>

      {/* NAVBAR */}
      <header className="navbar">
        <h2 className="logo" onClick={() => setPage("home")}>
          VOGUE<span>.</span>
        </h2>

        <nav>
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("shop")}>Shop</button>
          <button onClick={() => setPage("about")}>About</button>
          <button onClick={() => setPage("contact")}>Contact</button>
        </nav>

        <div className="nav-actions">
          <button onClick={() => setPage("wishlist")}>
            ♡ Wishlist ({wishlist.length})
          </button>

          <button onClick={() => setPage("cart")}>
            🛍 Cart ({cartCount})
          </button>

          {user && (
            <button onClick={openMyOrders}>
              📦 My Orders
            </button>
          )}

          {user?.role === "admin" && (
            <button
              onClick={openAdminPanel}
              style={{ color: "#d4af37", fontWeight: "bold" }}
            >
              ⚙ Admin Panel
            </button>
          )}

          {user ? (
            <>
              <button className="login-nav-btn">
                Hi, {user.name}
              </button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="login-nav-btn" onClick={openLogin}>
              Login
            </button>
          )}
        </div>
      </header>

      {/* HOME */}
      {page === "home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow">THE NEW FASHION EXPERIENCE</p>
              <h1>STYLE THAT<br />LIGHTS YOU UP.</h1>
              <p>Discover your style. Define your personality.</p>

              <button
                className="primary-btn"
                onClick={() => setPage("shop")}
              >
                EXPLORE COLLECTION →
              </button>
            </div>
          </section>

          <section className="features">
            <div>✦ <strong>Premium Quality</strong><small>Fashion that lasts</small></div>
            <div>✧ <strong>Free Shipping</strong><small>On orders above ₹1999</small></div>
            <div>❖ <strong>Easy Shopping</strong><small>Simple and secure experience</small></div>
          </section>

          <section className="home-products">
            <p className="eyebrow">HANDPICKED FOR YOU</p>
            <h2 className="section-title">Our Collection</h2>
            <p className="section-subtitle">Find your next favourite look.</p>
            <ProductList items={products.slice(0, 4)} />

            <div className="center-btn">
              <button
                className="primary-btn"
                onClick={() => setPage("shop")}
              >
                VIEW ALL PRODUCTS →
              </button>
            </div>
          </section>
        </>
      )}

      {/* SHOP */}
      {page === "shop" && (
        <main className="page-content">
          <p className="eyebrow center-text">DISCOVER YOUR STYLE</p>
          <h1 className="page-title">Shop Collection</h1>
          <p className="section-subtitle">Explore our latest fashion collection.</p>

          <div className="shop-toolbar">
            <input
              className="search-input"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="category-filters">
              {["All", "Men", "Women", "Accessories"].map((item) => (
                <button
                  key={item}
                  className={`filter-btn ${category === item ? "active" : ""}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <ProductList items={filteredProducts} />
        </main>
      )}

      {/* CART */}
      {page === "cart" && (
        <main className="page-content">
          <h1 className="page-title">Your Shopping Cart</h1>

          {placedOrder ? (
            <div
              className="empty-state"
              style={{
                maxWidth: "650px",
                margin: "30px auto",
                padding: "35px",
                border: "1px solid #d4af37",
                borderRadius: "12px"
              }}
            >
              <h2 style={{ color: "#d4af37" }}>
                Order Placed Successfully!
              </h2>

              <p>Thank you for shopping with VOGUE.</p>
              <p style={{ marginTop: "20px" }}>Your Order ID:</p>

              <h2 style={{ color: "#d4af37", overflowWrap: "anywhere" }}>
                {placedOrder.orderId}
              </h2>

              <p style={{ marginTop: "15px" }}>
                Total Amount: ₹{formatPrice(placedOrder.totalAmount)}
              </p>

              <p>Payment Method: Cash on Delivery</p>
              <p>Order Status: {placedOrder.orderStatus}</p>

              <button
                className="primary-btn"
                style={{ marginTop: "20px" }}
                onClick={() => {
                  setPlacedOrder(null);
                  setShowCheckout(false);
                  setPage("shop");
                }}
              >
                CONTINUE SHOPPING
              </button>
            </div>

          ) : cart.length === 0 ? (
            <div className="empty-state">
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything yet.</p>

              <button
                className="primary-btn"
                onClick={() => setPage("shop")}
              >
                START SHOPPING
              </button>
            </div>

          ) : showCheckout ? (
            <div
              className="checkout-form"
              style={{
                maxWidth: "750px",
                margin: "25px auto",
                padding: "25px",
                border: "1px solid #d4af37",
                borderRadius: "12px"
              }}
            >
              <h2>Delivery Details</h2>
              <p style={{ marginBottom: "20px" }}>
                Enter your address to complete your order.
              </p>

              <form onSubmit={handlePlaceOrder}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "15px"
                  }}
                >
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={shippingAddress.fullName}
                    onChange={handleAddressChange}
                    required
                    minLength={2}
                    style={{ width: "100%", padding: "13px" }}
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Mobile Number"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    title="Enter a valid 10-digit mobile number"
                    style={{ width: "100%", padding: "13px" }}
                  />

                  <input
                    type="text"
                    name="address"
                    placeholder="House No., Street, Area"
                    value={shippingAddress.address}
                    onChange={handleAddressChange}
                    required
                    style={{ width: "100%", padding: "13px" }}
                  />

                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    required
                    style={{ width: "100%", padding: "13px" }}
                  />

                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    required
                    style={{ width: "100%", padding: "13px" }}
                  />

                  <input
                    type="text"
                    name="pincode"
                    placeholder="PIN Code"
                    value={shippingAddress.pincode}
                    onChange={handleAddressChange}
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    title="Enter a valid 6-digit PIN code"
                    style={{ width: "100%", padding: "13px" }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "25px",
                    padding: "18px",
                    border: "1px solid #d4af37",
                    borderRadius: "8px"
                  }}
                >
                  <h3>Payment Method</h3>
                  <p style={{ marginTop: "10px" }}>
                    <strong>Cash on Delivery (COD)</strong>
                  </p>
                  <small>Pay when your order is delivered.</small>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <p>Subtotal: ₹{formatPrice(total)}</p>
                  <p>
                    Shipping: {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                  </p>
                  <h3 style={{ marginTop: "10px" }}>
                    Total: ₹{formatPrice(finalTotal)}
                  </h3>
                </div>

                {orderMessage && (
                  <p style={{ color: "#ff7070", marginTop: "15px" }}>
                    {orderMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="primary-btn full-btn"
                  disabled={placingOrder}
                  style={{ marginTop: "20px" }}
                >
                  {placingOrder ? "PLACING ORDER..." : "PLACE ORDER"}
                </button>

                <button
                  type="button"
                  className="primary-btn full-btn"
                  disabled={placingOrder}
                  onClick={() => {
                    setShowCheckout(false);
                    setOrderMessage("");
                  }}
                  style={{ marginTop: "10px" }}
                >
                  BACK TO CART
                </button>
              </form>
            </div>

          ) : (
            <div className="cart-layout">
              <div>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img src={item.image} alt={item.name} />

                    <div className="cart-details">
                      <h3>{item.name}</h3>
                      <p>₹{formatPrice(item.price)}</p>

                      <div className="quantity">
                        <button onClick={() => changeQty(item.id, -1)}>−</button>
                        <strong>{item.qty}</strong>
                        <button onClick={() => changeQty(item.id, 1)}>+</button>
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary">
                <h2>Order Summary</h2>

                <p>
                  <span>Subtotal</span>
                  <strong>₹{formatPrice(total)}</strong>
                </p>

                <p>
                  <span>Shipping</span>
                  <strong>{shippingCharge === 0 ? "FREE" : "₹99"}</strong>
                </p>

                <hr />

                <h3>
                  <span>Total</span>
                  <strong>₹{formatPrice(finalTotal)}</strong>
                </h3>

                <button
                  className="primary-btn full-btn"
                  onClick={openCheckout}
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* MY ORDERS */}
      {page === "orders" && (
        <main className="page-content">
          <p className="eyebrow center-text">YOUR VOGUE PURCHASES</p>
          <h1 className="page-title">My Orders</h1>
          <p className="section-subtitle">
            View and track all your VOGUE orders.
          </p>

          {!user ? (
            <div className="empty-state">
              <h2>Please login first</h2>
              <button className="primary-btn" onClick={openLogin}>
                LOGIN
              </button>
            </div>
          ) : ordersLoading ? (
            <div className="empty-state">
              <h2>Loading your orders...</h2>
            </div>
          ) : ordersError ? (
            <div className="empty-state">
              <h2>Unable to load orders</h2>
              <p>{ordersError}</p>
              <button className="primary-btn" onClick={fetchMyOrders}>
                TRY AGAIN
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <h2>No orders yet</h2>
              <p>Your placed orders will appear here.</p>
              <button
                className="primary-btn"
                onClick={() => setPage("shop")}
              >
                START SHOPPING
              </button>
            </div>
          ) : selectedOrder ? (
            <OrderDetails
              order={selectedOrder}
              onBack={() => setSelectedOrder(null)}
            />
          ) : (
            <div
              style={{
                maxWidth: "900px",
                margin: "25px auto",
                padding: "18px",
                border: "1px solid #d4af37",
                borderRadius: "12px"
              }}
            >
              <h2 style={{ marginBottom: "12px" }}>
                All Orders ({orders.length})
              </h2>

              {orders.map((order, index) => (
                <div
                  key={order._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    padding: "15px 5px",
                    borderBottom:
                      index !== orders.length - 1
                        ? "1px solid #555"
                        : "none"
                  }}
                >
                  <div style={{ flex: "1", minWidth: "200px" }}>
                    <strong style={{ color: "#d4af37", overflowWrap: "anywhere" }}>
                      {order.orderId}
                    </strong>

                    <p style={{ fontSize: "13px", marginTop: "5px" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      {" · "}
                      {order.items?.length || 0} Products
                    </p>

                    <strong>₹{formatPrice(order.totalAmount)}</strong>

                    <p style={{ fontSize: "13px" }}>
                      {order.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : order.paymentMethod}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ color: statusColor(order.orderStatus), fontSize: "13px", fontWeight: "bold" }}>
                      {order.orderStatus}
                    </span>

                    <button
                      className="primary-btn"
                      onClick={() => setSelectedOrder(order)}
                      style={{ padding: "9px 14px", fontSize: "12px" }}
                    >
                      VIEW DETAILS →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ADMIN DASHBOARD */}
      {page === "admin" && (
        <main className="page-content">
          <p className="eyebrow center-text">VOGUE MANAGEMENT</p>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="section-subtitle">
            Manage customer orders and track store activity.
          </p>

          {!user || user.role !== "admin" ? (
            <div className="empty-state">
              <h2>Admin access denied</h2>
              <button className="primary-btn" onClick={() => setPage("home")}>
                GO HOME
              </button>
            </div>
          ) : adminLoading ? (
            <div className="empty-state">
              <h2>Loading admin dashboard...</h2>
            </div>
          ) : adminError ? (
            <div className="empty-state">
              <h2>Unable to load dashboard</h2>
              <p>{adminError}</p>
              <button className="primary-btn" onClick={fetchAdminOrders}>
                TRY AGAIN
              </button>
            </div>
          ) : (
            <>
              {/* DASHBOARD STATS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "15px",
                  maxWidth: "1100px",
                  margin: "30px auto"
                }}
              >
                {[
                  { label: "Total Orders", value: adminOrders.length, color: "#d4af37" },
                  { label: "Total Sales", value: `₹${formatPrice(adminSales)}`, color: "#4ade80" },
                  { label: "Pending", value: pendingCount, color: "#d4af37" },
                  { label: "Confirmed", value: confirmedCount, color: "#a78bfa" },
                  { label: "Shipped", value: shippedCount, color: "#60a5fa" },
                  { label: "Delivered", value: deliveredCount, color: "#4ade80" },
                  { label: "Cancelled", value: cancelledCount, color: "#ff7070" }
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: "22px",
                      border: "1px solid #d4af37",
                      borderRadius: "10px",
                      textAlign: "center",
                      background: "rgba(255,255,255,0.025)"
                    }}
                  >
                    <p style={{ fontSize: "14px", opacity: 0.8 }}>
                      {stat.label}
                    </p>
                    <h2 style={{ color: stat.color, marginTop: "10px", overflowWrap: "anywhere" }}>
                      {stat.value}
                    </h2>
                  </div>
                ))}
              </div>

              {/* ALL ORDERS */}
              <div
                style={{
                  maxWidth: "1100px",
                  margin: "35px auto",
                  padding: "20px",
                  border: "1px solid #d4af37",
                  borderRadius: "12px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <h2>All Customer Orders ({adminOrders.length})</h2>

                  <button
                    className="primary-btn"
                    onClick={fetchAdminOrders}
                    style={{ padding: "10px 16px" }}
                  >
                    ↻ REFRESH
                  </button>
                </div>

                {adminOrders.length === 0 ? (
                  <div className="empty-state">
                    <h2>No customer orders yet</h2>
                    <p>New orders will appear here.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto", marginTop: "20px" }}>
                    {adminOrders.map((order) => (
                      <div
                        key={order._id}
                        style={{
                          padding: "20px 5px",
                          borderBottom: "1px solid #555",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                          gap: "15px",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <strong style={{ color: "#d4af37", overflowWrap: "anywhere" }}>
                            {order.orderId}
                          </strong>
                          <p style={{ fontSize: "13px", marginTop: "6px" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN")}
                          </p>
                          <p style={{ fontSize: "13px" }}>
                            {order.items?.length || 0} Products
                          </p>
                        </div>

                        <div>
                          <strong>{order.userId?.name || "Customer"}</strong>
                          <p style={{ fontSize: "13px", overflowWrap: "anywhere" }}>
                            {order.userId?.email || "N/A"}
                          </p>
                          <p style={{ fontSize: "13px" }}>
                            Phone: {order.shippingAddress?.phone || "N/A"}
                          </p>
                        </div>

                        <div>
                          <strong>₹{formatPrice(order.totalAmount)}</strong>
                          <p style={{ fontSize: "13px" }}>
                            {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
                          </p>
                          <p style={{ fontSize: "13px" }}>
                            Payment: {order.paymentStatus}
                          </p>
                        </div>

                        <div>
                          <p style={{ fontSize: "13px", marginBottom: "7px" }}>
                            Order Status
                          </p>

                          <select
                            value={order.orderStatus}
                            disabled={updatingOrder === order.orderId}
                            onChange={(e) =>
                              updateOrderStatus(order.orderId, e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "6px",
                              border: "1px solid #d4af37",
                              background: "#171717",
                              color: statusColor(order.orderStatus),
                              cursor: "pointer"
                            }}
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          {updatingOrder === order.orderId && (
                            <small>Updating...</small>
                          )}
                        </div>

                        <div>
                          <button
                            className="primary-btn"
                            onClick={() => {
                              setSelectedOrder(order);
                              setPage("admin-details");
                            }}
                            style={{ padding: "10px 14px", fontSize: "12px" }}
                          >
                            VIEW DETAILS →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      )}

      {/* ADMIN ORDER DETAILS */}
      {page === "admin-details" && selectedOrder && user?.role === "admin" && (
        <main className="page-content">
          <p className="eyebrow center-text">VOGUE MANAGEMENT</p>
          <h1 className="page-title">Customer Order</h1>

          <OrderDetails
            order={selectedOrder}
            admin
            onBack={() => {
              setSelectedOrder(null);
              setPage("admin");
            }}
          />

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Update Order Status
            </label>

            <select
              value={selectedOrder.orderStatus}
              disabled={updatingOrder === selectedOrder.orderId}
              onChange={(e) =>
                updateOrderStatus(selectedOrder.orderId, e.target.value)
              }
              style={{
                padding: "12px",
                borderRadius: "6px",
                background: "#171717",
                color: "#d4af37",
                border: "1px solid #d4af37",
                minWidth: "220px"
              }}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </main>
      )}

      {/* WISHLIST */}
      {page === "wishlist" && (
        <main className="page-content">
          <h1 className="page-title">Your Wishlist ♡</h1>

          {wishlist.length === 0 ? (
            <div className="empty-state">
              <h2>No saved products yet</h2>
              <p>Save your favourite styles here.</p>

              <button
                className="primary-btn"
                onClick={() => setPage("shop")}
              >
                EXPLORE SHOP
              </button>
            </div>
          ) : (
            <ProductList items={wishlist} />
          )}
        </main>
      )}

      {/* ABOUT */}
      {page === "about" && (
        <main className="info-page">
          <p className="eyebrow">OUR STORY</p>
          <h1 className="page-title">About VOGUE</h1>
          <p>
            VOGUE is a fashion destination built around confidence, creativity
            and individuality. Our collection brings together modern designs
            and timeless style to help you express yourself.
          </p>
        </main>
      )}

      {/* CONTACT */}
      {page === "contact" && <ContactPage />}

      {/* FOOTER */}
      <footer className="footer">
        <h2>VOGUE<span>.</span></h2>
        <p>Style that lights you up.</p>
        <small>© 2026 VOGUE. All rights reserved.</small>
      </footer>

      {/* LOGIN / SIGNUP MODAL */}
      {showLogin && (
        <div className={`login-overlay ${lightOn ? "light-active" : ""}`}>
          <button
            className="modal-close"
            onClick={() => setShowLogin(false)}
          >
            ×
          </button>

          <div className="room-glow"></div>

          <div
            className="rope"
            onClick={() => setLightOn(!lightOn)}
          ></div>

          <div
            className="bulb-wrap"
            onClick={() => setLightOn(!lightOn)}
          >
            <div className="bulb"></div>
            <div className="bulb-base"></div>
            <span className="bulb-hint">
              {lightOn ? "LIGHT ON" : "PULL TO LIGHT"}
            </span>
          </div>

          <div className="light-beam"></div>

          <div className="login-box">
            <p className="eyebrow">WELCOME TO VOGUE</p>

            <h2>
              {authMode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
            </h2>

            <p className="login-subtitle">
              Your style journey starts here.
            </p>

            <form onSubmit={handleAuth}>
              {authMode === "signup" && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password (minimum 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              {authMessage && (
                <p
                  style={{
                    color: authError ? "#ff7070" : "#d4af37",
                    margin: "10px 0",
                    fontSize: "14px"
                  }}
                >
                  {authMessage}
                </p>
              )}

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "PLEASE WAIT..."
                  : authMode === "login"
                  ? "LOGIN"
                  : "SIGN UP"}
              </button>
            </form>

            <p className="switch-auth">
              {authMode === "login"
                ? "New to VOGUE?"
                : "Already have an account?"}

              <button type="button" onClick={switchAuthMode}>
                {authMode === "login"
                  ? " Create account"
                  : " Login"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
