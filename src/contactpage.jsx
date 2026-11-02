function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Data Saved Successfully");
    e.target.reset();
  };

  const pageStyle = {
    minHeight: "100vh",
    width: "100%",
    padding: "50px 20px",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #00c6ff, #a044a0)",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "780px",
    padding: "40px",
    boxSizing: "border-box",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
    color: "#222",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "12px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#222",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 2px",
    boxSizing: "border-box",
    border: "none",
    borderBottom: "2px solid #222",
    outline: "none",
    background: "transparent",
    color: "#222",
    fontSize: "16px",
  };

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "35px 40px",
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <h1 style={{
          textAlign: "center",
          fontSize: "38px",
          color: "#222",
          marginBottom: "40px",
          textShadow: "2px 3px 5px rgba(0,0,0,0.25)"
        }}>
          VOGUE Contact Us
        </h1>

        <form onSubmit={handleSubmit}>

          <div style={rowStyle}>

            <div>
              <label style={labelStyle}>First Name</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Enter First Name"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Enter Last Name"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="Enter Email Address"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Website Name</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Enter Website Name"
              />
            </div>

          </div>

          <div style={{ marginTop: "40px" }}>
            <label style={labelStyle}>
              Write Your Message
            </label>

            <textarea
              placeholder="Write your message here..."
              maxLength="500"
              required
              rows="5"
              style={{
                width: "100%",
                padding: "12px",
                boxSizing: "border-box",
                border: "1px solid #777",
                borderRadius: "5px",
                fontSize: "16px",
                color: "#222",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "180px",
              padding: "12px",
              marginTop: "30px",
              border: "none",
              borderRadius: "6px",
              background: "linear-gradient(to right, #00c6ff, #a044a0)",
              color: "white",
              fontSize: "19px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            SUBMIT
          </button>

        </form>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .contact-mobile-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ContactPage;