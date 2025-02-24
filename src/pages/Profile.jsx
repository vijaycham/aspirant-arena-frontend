import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { updateProfile } from "../redux/user/profileSlice";
import axios from "axios";

const Profile = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        emailId: currentUser.emailId || "", // Ensure correct key
        age: currentUser.age || "",
        gender: currentUser.gender || "male",
        password: "",
        confirmPassword: "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showPasswordFields && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage

      const response = await axios.put(
        "http://localhost:8888/api/user/update",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Attach token here
          },
          withCredentials: true,
        }
      );

      dispatch(updateProfile(response.data));
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile");
    }
  };


  return (
    <div className="p-6 max-w-lg mx-auto my-10 bg-white rounded-lg shadow-lg">
      <h1 className="text-center text-3xl font-semibold my-6">Profile</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4"
      >
        <img
          src={currentUser?.photoUrl || "/default-profile.png"}
          alt="profile"
          className="h-24 w-24 rounded-full cursor-pointer object-cover border-2 border-gray-300 shadow-md"
        />
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400"
          value={formData.emailId}
          disabled
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400"
          value={formData.age}
          onChange={handleChange}
        />
        <select
          name="gender"
          className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <button
          type="button"
          className="text-blue-600 underline focus:outline-none"
          onClick={() => setShowPasswordFields(!showPasswordFields)}
        >
          {showPasswordFields ? "Cancel Password Update" : "Change Password"}
        </button>
        {showPasswordFields && (
          <>
            <input
              type="password"
              name="password"
              placeholder="New Password"
              className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </>
        )}
        <button
          type="submit"
          className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
