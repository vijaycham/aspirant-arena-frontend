import React from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold mt-8 mb-4">Sign Up</h1>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4 p-4 rounded-lg"
      >
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="First Name"
            id="firstname"
            className="bg-orange-50 p-2 rounded-lg w-full sm:w-1/2 outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            id="lastname"
            className="bg-orange-50 p-2 rounded-lg w-full sm:w-1/2 outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          id="email"
          className="bg-orange-50 p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="bg-orange-50 p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          id="confirmPassword"
          className="bg-orange-50 p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-orange-400"
          required
        />

        <button
          type="submit"
          className="bg-orange-500 text-white p-2 rounded-lg uppercase hover:bg-orange-600 w-full"
        >
          Sign Up
        </button>
      </form>
      <div className="flex justify-center gap-2 mt-5">
        <p>Have an account?</p>
        <Link to="/signin">
          <span className="text-blue-500 hover:underline">Sign in</span>
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
