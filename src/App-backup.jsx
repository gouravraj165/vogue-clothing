import { useEffect, useState } from "react";
import "./App.css";
import ContactPage from "./contactpage";

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


function App() {
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("vogueCart") || "[]");
  });

  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("vogueWishlist") || "[]");
  });

  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [lightOn, setLightOn] = useState(false);

  useEffect(() => {
    localStorage.setItem("vogueCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("vogueWishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addToCart = (product) => {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);

      if (existing) {
        return previous.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
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
    setShowLogin(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "All" || product.category === category;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

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
                  wishlist.some((item) => item.id === product.id) ? "saved" : ""
                }`}
                onClick={() => toggleWishlist(product)}
              >
                {wishlist.some((item) => item.id === product.id) ? "♥" : "♡"}
              </button>
              <span className="product-tag">VOGUE EDIT</span>
            </div>

            <div className="product-info">
              <p className="product-category">{product.category}</p>
              <h3>{product.name}</h3>
              <strong>₹{product.price.toLocaleString("en-IN")}</strong>
              <button className="add-btn" onClick={() => addToCart(product)}>
                ADD TO CART +
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="app">
      <div className="top-strip">
        ✦ FREE SHIPPING ON ORDERS ABOVE ₹1999 ✦
      </div>

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
          <button className="login-nav-btn" onClick={openLogin}>
            Login
          </button>
        </div>
      </header>

      {page === "home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow">THE NEW FASHION EXPERIENCE</p>
              <h1>STYLE THAT<br />LIGHTS YOU UP.</h1>
              <p>Discover your style. Define your personality.</p>
              <button className="primary-btn" onClick={() => setPage("shop")}>
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
              <button className="primary-btn" onClick={() => setPage("shop")}>
                VIEW ALL PRODUCTS →
              </button>
            </div>
          </section>
        </>
      )}

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

      {page === "cart" && (
        <main className="page-content">
          <h1 className="page-title">Your Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="empty-state">
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything yet.</p>
              <button className="primary-btn" onClick={() => setPage("shop")}>
                START SHOPPING
              </button>
            </div>
          ) : (
            <div className="cart-layout">
              <div>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <div className="cart-details">
                      <h3>{item.name}</h3>
                      <p>₹{item.price.toLocaleString("en-IN")}</p>
                      <div className="quantity">
                        <button onClick={() => changeQty(item.id, -1)}>−</button>
                        <strong>{item.qty}</strong>
                        <button onClick={() => changeQty(item.id, 1)}>+</button>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary">
                <h2>Order Summary</h2>
                <p><span>Subtotal</span><strong>₹{total.toLocaleString("en-IN")}</strong></p>
                <p><span>Shipping</span><strong>{total >= 1999 ? "FREE" : "₹99"}</strong></p>
                <hr />
                <h3>
                  <span>Total</span>
                  <strong>₹{(total + (total >= 1999 ? 0 : 99)).toLocaleString("en-IN")}</strong>
                </h3>
                <button className="primary-btn full-btn" onClick={() => alert("Demo checkout: Payment gateway is not connected yet.")}>
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {page === "wishlist" && (
        <main className="page-content">
          <h1 className="page-title">Your Wishlist ♡</h1>
          {wishlist.length === 0 ? (
            <div className="empty-state">
              <h2>No saved products yet</h2>
              <p>Save your favourite styles here.</p>
              <button className="primary-btn" onClick={() => setPage("shop")}>EXPLORE SHOP</button>
            </div>
          ) : (
            <ProductList items={wishlist} />
          )}
        </main>
      )}

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
      {page === "contact" && <ContactPage />}


      <footer className="footer">
        <h2>VOGUE<span>.</span></h2>
        <p>Style that lights you up.</p>
        <small>© 2026 VOGUE. All rights reserved.</small>
      </footer>

      {showLogin && (
        <div className={`login-overlay ${lightOn ? "light-active" : ""}`}>
          <button className="modal-close" onClick={() => setShowLogin(false)}>×</button>

          <div className="room-glow"></div>
          <div className="rope" onClick={() => setLightOn(!lightOn)}></div>

          <div className="bulb-wrap" onClick={() => setLightOn(!lightOn)}>
            <div className="bulb"></div>
            <div className="bulb-base"></div>
            <span className="bulb-hint">PULL TO LIGHT</span>
          </div>

          <div className="light-beam"></div>

          <div className="login-box">
            <p className="eyebrow">WELCOME TO VOGUE</p>
            <h2>{authMode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}</h2>
            <p className="login-subtitle">Your style journey starts here.</p>

            {authMode === "signup" && (
              <input type="text" placeholder="Full Name" required />
            )}
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />

            <button className="login-submit" onClick={() => alert("Demo login only. Backend authentication is not connected yet.")}>
              {authMode === "login" ? "LOGIN" : "SIGN UP"}
            </button>

            <p className="switch-auth">
              {authMode === "login" ? "New to VOGUE?" : "Already have an account?"}
              <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                {authMode === "login" ? " Create account" : " Login"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
