import React, { useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import axios from "axios";

const SignIn = () => {
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8888/api/auth/signin",
        formData
      );

      console.log("Sign In success!", res.data.message);
      setLoading(false);
      setError(""); // Clear error if successful

      navigate("/"); 

    } catch (error) {
      setLoading(false);

      if (error.response && error.response.data.error) {
        setError(error.response.data.error); // Show backend error message
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold mt-8 mb-4">Sign In</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-4 rounded-lg"
      >
        <input
          type="email"
          placeholder="Email"
          id="emailId"
          className="bg-orange-50 p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
          required
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder="Password"
          id="password"
          className="bg-orange-50 p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
          required
          onChange={handleChange}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white p-2 rounded-lg uppercase hover:bg-orange-600 w-full"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
      </form>
      {error && <p className="text-red-700 text-sm">* {error}</p>}
      <div className="flex justify-center gap-2 mt-5">
        <p>Don't have an account?</p>
        <Link to="/signup">
          <span className="text-blue-500 hover:underline">Sign Up</span>
        </Link>
      </div>
    </div>
  );
};


export default SignIn;
