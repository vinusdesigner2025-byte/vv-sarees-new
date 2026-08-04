import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      email === "admin@vvsarees.com" &&
      password === "123456"
    ) {
      localStorage.setItem("vv-admin-session", "true");
      navigate("/admin/dashboard");
      return;
    }

    alert("Invalid email or password");
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>VV Sarees</h1>
        <p>Admin CMS Login</p>

        <form onSubmit={handleLogin}>
          <div className="admin-input-group">
            <label htmlFor="admin-email">Email</label>

            <input
              id="admin-email"
              type="email"
              placeholder="admin@vvsarees.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="admin-input-group">
            <label htmlFor="admin-password">Password</label>

            <input
              id="admin-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}