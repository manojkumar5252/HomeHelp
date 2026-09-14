import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function WorkerLogin() {
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
      alert("Please enter your login details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/workers/login`,
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

      // Make sure worker data was returned
      if (!data.worker || !data.worker._id) {
        alert("Login successful, but worker information was not returned.");
        return;
      }

      // Save logged-in worker information
      sessionStorage.setItem("workerId", data.worker._id);
      sessionStorage.setItem("worker", JSON.stringify(data.worker));

      alert("Login successful!");

     navigate("/worker-dashboard", { replace: true });
    } catch (error) {
      console.error("Worker login error:", error);

      alert(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold tracking-tight">
              Home<span className="text-green-600">Help</span>
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              Trusted Help, Right Near You
            </p>
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex min-h-[calc(100vh-82px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
          
          {/* TITLE */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl">
              🔑
            </div>

            <h2 className="mt-5 text-3xl font-bold text-gray-900">
              Worker Login
            </h2>

            <p className="mt-2 text-gray-500">
              Login to manage your HomeHelp work.
            </p>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* EMAIL / PHONE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email or Phone Number
              </label>

              <input
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                placeholder="Enter your email or phone number"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <button
                type="button"
                onClick={() =>
                  alert("Password reset will be added later.")
                }
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                Forgot Password?
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* SIGNUP */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/worker-signup"
              className="font-semibold text-green-600 hover:text-green-700"
            >
              Create Account
            </Link>
          </div>

          {/* BACK */}
          <div className="mt-4 text-center">
            <Link
              to="/worker-auth"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              ← Back
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WorkerLogin;