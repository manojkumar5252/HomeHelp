import { Link } from "react-router-dom";

function WorkerAuth() {
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
            to="/"
            className="text-sm font-medium text-gray-600 hover:text-green-600"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-82px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
              🧑‍🔧
            </div>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
              Welcome, Worker
            </h2>

            <p className="mt-4 text-gray-600">
              Choose how you want to continue with HomeHelp.
            </p>
          </div>

          {/* Options */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Create Account */}
            <Link
              to="/worker-signup"
              className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                📝
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-900">
                Create Account
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                New to HomeHelp? Create your worker account and start
                offering your household services.
              </p>

              <div className="mt-7 font-semibold text-green-600">
                Create Account →
              </div>
            </Link>

            {/* Login */}
            <Link
              to="/worker-login"
              className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                🔐
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-900">
                Login
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Already have a HomeHelp worker account? Login to
                continue and manage your work.
              </p>

              <div className="mt-7 font-semibold text-blue-600">
                Login →
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WorkerAuth;