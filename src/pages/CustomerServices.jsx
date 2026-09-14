import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CustomerServices() {
  const navigate = useNavigate();

  useEffect(() => {
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId) {
      alert("Please login as a customer first.");
      navigate("/customer-login");
    }
  }, [navigate]);

  const services = [
    {
      category: "Cleaning & Organizing",
      icon: "🧹",
      items: [
        {
          name: "Surface Cleaning",
          price: 150,
          description:
            "Cleaning tables, shelves, countertops, and other household surfaces.",
        },
        {
          name: "Floor Care",
          price: 200,
          description:
            "Sweeping, mopping, and basic floor cleaning for your home.",
        },
        {
          name: "Deep Cleaning",
          price: 500,
          description:
            "Detailed cleaning of difficult-to-clean areas and household spaces.",
        },
        {
          name: "Tidying Up",
          price: 150,
          description:
            "Organizing rooms, arranging household items, and keeping spaces neat.",
        },
      ],
    },
    {
      category: "Kitchen & Meal Management",
      icon: "🍳",
      items: [
        {
          name: "Meal Prep",
          price: 300,
          description:
            "Basic preparation of ingredients and meals according to your needs.",
        },
        {
          name: "Dish Care",
          price: 150,
          description:
            "Washing and organizing used dishes and kitchen utensils.",
        },
        {
          name: "Kitchen Upkeep",
          price: 200,
          description:
            "Cleaning and maintaining kitchen counters, surfaces, and common areas.",
        },
      ],
    },
    {
      category: "Laundry & Fabric Care",
      icon: "👕",
      items: [
        {
          name: "Washing",
          price: 200,
          description:
            "Basic washing and handling of household clothes and fabrics.",
        },
        {
          name: "Drying",
          price: 150,
          description:
            "Drying clothes and fabrics after washing.",
        },
        {
          name: "Post-Wash Care",
          price: 150,
          description:
            "Folding, arranging, and basic care of washed clothes.",
        },
        {
          name: "Linens",
          price: 200,
          description:
            "Care and changing of household linens such as bedsheets and covers.",
        },
      ],
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Our Services</h1>
            <p style={styles.subtitle}>
              Explore the household services available through HomeHelp.
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={() => navigate("/customer-dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        {/* Approximate Price Notice */}
        <div style={styles.notice}>
          <span style={styles.noticeIcon}>ℹ️</span>

          <div>
            <strong>Approximate Prices</strong>
            <p style={styles.noticeText}>
              Prices shown below are approximate starting estimates. Final
              service prices may vary depending on the service requirements
              and booking details.
            </p>
          </div>
        </div>

        {/* Service Categories */}
        {services.map((category) => (
          <section key={category.category} style={styles.categorySection}>
            <div style={styles.categoryHeader}>
              <span style={styles.categoryIcon}>{category.icon}</span>
              <h2 style={styles.categoryTitle}>{category.category}</h2>
            </div>

            <div style={styles.servicesGrid}>
              {category.items.map((service) => (
                <div key={service.name} style={styles.serviceCard}>
                  <div style={styles.cardTop}>
                    <h3 style={styles.serviceName}>{service.name}</h3>

                    <span style={styles.price}>
                      ₹{service.price} approx.
                    </span>
                  </div>

                  <p style={styles.description}>{service.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Booking Section */}
        <div style={styles.bookingSection}>
          <h2 style={styles.bookingTitle}>Ready to Book a Service?</h2>

          <p style={styles.bookingText}>
            Select the services you need, choose your service location, and
            continue with your booking.
          </p>

          <button
            style={styles.bookButton}
            onClick={() => navigate("/services")}
          >
            Book a Service
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },

  title: {
    margin: "0 0 8px",
    fontSize: "36px",
    color: "#222",
  },

  subtitle: {
    margin: 0,
    color: "#666",
    fontSize: "16px",
  },

  backButton: {
    border: "none",
    backgroundColor: "#fff",
    color: "#333",
    padding: "12px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    backgroundColor: "#fff8e6",
    border: "1px solid #f1d58a",
    borderRadius: "10px",
    padding: "18px",
    marginBottom: "35px",
  },

  noticeIcon: {
    fontSize: "20px",
  },

  noticeText: {
    margin: "5px 0 0",
    color: "#666",
    lineHeight: "1.5",
  },

  categorySection: {
    marginBottom: "40px",
  },

  categoryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },

  categoryIcon: {
    fontSize: "30px",
  },

  categoryTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#222",
  },

  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },

  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
    border: "1px solid #eee",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "12px",
  },

  serviceName: {
    margin: 0,
    fontSize: "19px",
    color: "#222",
  },

  price: {
    whiteSpace: "nowrap",
    fontSize: "14px",
    fontWeight: "600",
    color: "#16803c",
    backgroundColor: "#eaf8ef",
    padding: "6px 9px",
    borderRadius: "6px",
  },

  description: {
    margin: 0,
    color: "#666",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  bookingSection: {
    backgroundColor: "#fff",
    textAlign: "center",
    padding: "35px 20px",
    borderRadius: "14px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
    marginTop: "20px",
  },

  bookingTitle: {
    margin: "0 0 10px",
    fontSize: "25px",
    color: "#222",
  },

  bookingText: {
    margin: "0 auto 20px",
    maxWidth: "650px",
    color: "#666",
    lineHeight: "1.6",
  },

  bookButton: {
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "13px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },
};

export default CustomerServices;