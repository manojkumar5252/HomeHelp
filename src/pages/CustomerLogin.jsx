import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function CustomerLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.emailOrPhone || !formData.password) {
      alert("Please enter your email/phone and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/customers/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailOrPhone: formData.emailOrPhone,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed.");
        return;
      }

      /*
       * Save customer ID
       */
      sessionStorage.setItem("customerId", data.customer._id);

      /*
       * Save complete customer object
       * so the dashboard can display saved
       * address and house details.
       */
      sessionStorage.setItem(
        "customer",
        JSON.stringify(data.customer)
      );

      /*
       * Login always goes to customer dashboard.
       */
      alert("Login successful!");

      navigate("/customer-dashboard", { replace: true });
    } catch (error) {
      console.error("Customer login error:", error);

      alert(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Home<span className="text-blue-600">Help</span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Trusted Help, Right Near You
            </p>
          </div>

          <Link
            to="/customer-auth"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            ← Back
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-82px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
            {/* Icon & Heading */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                🔐
              </div>

              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Welcome Back
              </h2>

              <p className="mt-3 text-gray-600">
                Login to your HomeHelp customer account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email / Phone */}
              <div>
                <label
                  htmlFor="emailOrPhone"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email or Phone Number
                </label>

                <input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  type="text"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  placeholder="Enter your email or phone"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() =>
                    alert("Password recovery will be added later.")
                  }
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-7 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/customer-signup"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CustomerLogin;