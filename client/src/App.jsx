import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Interview from "./pages/Interview";
import History from "./pages/History";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-gray-900">
          <Navbar user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/interview"
              element={
                <PrivateRoute>
                  <Interview user={user} />
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <History user={user} />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route
              path="/register"
              element={<Register onRegister={setUser} />}
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile user={user} onUpdate={setUser} />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <Analytics user={user} />
                </PrivateRoute>
              }
            />
          </Routes>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
