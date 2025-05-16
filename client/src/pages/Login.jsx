import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, email, password };
      if (isLogin) {
        // Login
        const res = await axios.post(
          "http://localhost:5000/api/user/login",
          payload
        );
        localStorage.setItem("user", JSON.stringify(res.data));
        toast.success("Login successful!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        // Register
        await axios.post("http://localhost:5000/api/user/register", payload);
        toast.success("Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
      <ToastContainer position="top-center" autoClose={2000} />
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-8 rounded-xl shadow-lg flex flex-col gap-6 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          {isLogin ? "Login" : "Register"}
        </h2>
        <input
          type="text"
          placeholder="Name"
          className="p-3 rounded-lg bg-white/20 text-white focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded-lg bg-white/20 text-white focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 rounded-lg bg-white/20 text-white focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
        >
          {isLogin ? "Login" : "Register"}
        </button>
        <button
          type="button"
          className="text-blue-300 hover:underline mt-2"
          onClick={() => setIsLogin((prev) => !prev)}
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
