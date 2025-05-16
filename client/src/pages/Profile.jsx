import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = ({ user: propUser, onUpdate }) => {
  const [user, setUser] = useState(
    () => propUser || JSON.parse(localStorage.getItem("user"))
  );
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = user?.token;
      const res = await axios.patch(
        "http://localhost:5000/api/user/profile",
        { name, email, phone, password: password || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, name, email, phone };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (onUpdate) {
        onUpdate(updatedUser);
      }
      setUser(updatedUser);
      setPassword("");
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900 p-4">
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="w-full max-w-md">
        <div className="bg-white/10 p-8 rounded-xl shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Profile Settings
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
