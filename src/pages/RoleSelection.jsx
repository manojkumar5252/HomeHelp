import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fbff 0%, #f4f8ff 45%, #f8fcf9 100%)",
        color: "#172033",
        fontFamily:
          "'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: "78px",
          padding: "0 7%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.94)",
          borderBottom: "1px solid #e8edf5",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "21px",
              fontWeight: "800",
              boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
            }}
          >
            H
          </div>

          <span
            style={{
              fontSize: "24px",
              fontWeight: "800",
              letterSpacing: "-0.8px",
              color: "#172033",
            }}
          >
            Home<span style={{ color: "#2563eb" }}>Help</span>
          </span>
        </div>

        {/* Admin Login */}
        <button
          onClick={() => navigate("/admin-login")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#ffffff",
            border: "1px solid #cfd7e6",
            color: "#344054",
            padding: "10px 18px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "700",
            fontFamily: "inherit",
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(16,24,40,0.04)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f5f8ff";
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.color = "#2563eb";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#cfd7e6";
            e.currentTarget.style.color = "#344054";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "16px" }}>🔐</span>
          Admin Login
        </button>
      </header>

      {/* Main */}
      <main
        style={{
          minHeight: "calc(100vh - 78px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "55px 7%",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Decorative background shapes */}
        <div
          style={{
            position: "absolute",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "#e8f0ff",
            top: "-150px",
            right: "-130px",
            opacity: 0.7,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "330px",
            height: "330px",
            borderRadius: "50%",
            background: "#e8f8ee",
            bottom: "-130px",
            left: "-110px",
            opacity: 0.75,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: "1080px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Hero */}
          <section
            style={{
              textAlign: "center",
              marginBottom: "46px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                padding: "8px 16px",
                borderRadius: "30px",
                background: "#eaf1ff",
                color: "#2563eb",
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "1.2px",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#2563eb",
                }}
              />
              YOUR HOME. OUR HELP.
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(40px, 6vw, 64px)",
                lineHeight: "1.08",
                fontWeight: "800",
                letterSpacing: "-2.8px",
                color: "#101828",
              }}
            >
              Home help,
              <br />
              <span
                style={{
                  color: "#2563eb",
                }}
              >
                made simple.
              </span>
            </h1>

            <p
              style={{
                maxWidth: "640px",
                margin: "20px auto 0",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "#667085",
                fontWeight: "400",
              }}
            >
              Whether you need a helping hand at home or want to offer your
              skills, HomeHelp brings people together.
            </p>
          </section>

          {/* Role Selection */}
          <section>
            <p
              style={{
                textAlign: "center",
                margin: "0 0 20px",
                color: "#475467",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              How would you like to continue?
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              {/* Customer Card */}
              <div
                onClick={() => navigate("/customer-login")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-7px)";
                  e.currentTarget.style.boxShadow =
                    "0 24px 50px rgba(37,99,235,0.16)";
                  e.currentTarget.style.borderColor = "#cbdcff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(16,24,40,0.07)";
                  e.currentTarget.style.borderColor = "#e4e9f2";
                }}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e9f2",
                  borderRadius: "22px",
                  padding: "34px",
                  cursor: "pointer",
                  boxShadow: "0 12px 30px rgba(16,24,40,0.07)",
                  transition: "all 0.25s ease",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "18px",
                      background: "#eaf1ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "30px",
                    }}
                  >
                    🏠
                  </div>

                  <span
                    style={{
                      color: "#2563eb",
                      fontSize: "26px",
                      fontWeight: "600",
                    }}
                  >
                    ↗
                  </span>
                </div>

                <h2
                  style={{
                    margin: "27px 0 10px",
                    fontSize: "25px",
                    lineHeight: "1.3",
                    fontWeight: "700",
                    letterSpacing: "-0.6px",
                    color: "#111827",
                  }}
                >
                  I need a service
                </h2>

                <p
                  style={{
                    margin: "0 0 28px",
                    color: "#667085",
                    fontSize: "14px",
                    lineHeight: "1.8",
                    minHeight: "51px",
                    fontWeight: "400",
                  }}
                >
                  Find trusted professionals for your home and book the help
                  you need.
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/customer-login");
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: "11px",
                    padding: "15px",
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "700",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    boxShadow: "0 8px 18px rgba(37,99,235,0.2)",
                  }}
                >
                  Continue as Customer
                  <span style={{ marginLeft: "8px" }}>→</span>
                </button>
              </div>

              {/* Worker Card */}
              <div
                onClick={() => navigate("/worker-login")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-7px)";
                  e.currentTarget.style.boxShadow =
                    "0 24px 50px rgba(22,163,74,0.16)";
                  e.currentTarget.style.borderColor = "#c8ebd3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(16,24,40,0.07)";
                  e.currentTarget.style.borderColor = "#e4e9f2";
                }}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e9f2",
                  borderRadius: "22px",
                  padding: "34px",
                  cursor: "pointer",
                  boxShadow: "0 12px 30px rgba(16,24,40,0.07)",
                  transition: "all 0.25s ease",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "18px",
                      background: "#eaf9ef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "30px",
                    }}
                  >
                    🛠️
                  </div>

                  <span
                    style={{
                      color: "#16a34a",
                      fontSize: "26px",
                      fontWeight: "600",
                    }}
                  >
                    ↗
                  </span>
                </div>

                <h2
                  style={{
                    margin: "27px 0 10px",
                    fontSize: "25px",
                    lineHeight: "1.3",
                    fontWeight: "700",
                    letterSpacing: "-0.6px",
                    color: "#111827",
                  }}
                >
                  I provide services
                </h2>

                <p
                  style={{
                    margin: "0 0 28px",
                    color: "#667085",
                    fontSize: "14px",
                    lineHeight: "1.8",
                    minHeight: "51px",
                    fontWeight: "400",
                  }}
                >
                  Put your skills to work, connect with customers, and manage
                  your home service jobs.
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/worker-login");
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: "11px",
                    padding: "15px",
                    background:
                      "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "700",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    boxShadow: "0 8px 18px rgba(22,163,74,0.2)",
                  }}
                >
                  Continue as Worker
                  <span style={{ marginLeft: "8px" }}>→</span>
                </button>
              </div>
            </div>
          </section>

          {/* Trust Line */}
          <div
            style={{
              marginTop: "34px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              color: "#98a2b3",
              fontSize: "12px",
              fontWeight: "500",
              flexWrap: "wrap",
            }}
          >
            <span>Simple booking</span>
            <span>•</span>
            <span>Trusted professionals</span>
            <span>•</span>
            <span>Reliable service</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleSelection;