import { useState } from "react";
import api from "../../api.js";
import { useNavigate, Navigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants.js";
import "./form.css";
import { toast } from 'react-toastify';

function Form({ route, method }) {
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Register";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
   toast.error('Password must be 8+ characters with a letter and number.');
    setLoading(false);
    return;
  }
    try {
      const res = await api.post(route, { Email, password });
      if (method == "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/home");
      } else {
        navigate("/Login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>{name}</h1>
      <input
        className="form-input"
        type="email"
        value={Email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button className="form-button" type="submit">
        {name}
      </button>
    </form>
  );
}
export default Form;
