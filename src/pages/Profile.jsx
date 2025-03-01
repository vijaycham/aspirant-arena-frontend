import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { updateProfile } from "../redux/user/profileSlice";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    age: "",
    gender: "male",
    password: "",
    confirmPassword: "",
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        dispatch(updateProfile(response.data.user));
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        emailId: currentUser.emailId || "",
        age: currentUser.age || "",
        gender: currentUser.gender || "male",
        password: "",
        confirmPassword: "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const updateData = {
        ...formData,
        password: showPasswordFields ? formData.password : undefined,
      };

      await axios.put(`${API_URL}/api/profile`, updateData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const response = await axios.get(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      dispatch(updateProfile(response.data.user));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 animate-fadeIn">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h1 className="text-center text-3xl font-semibold my-6">Profile</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4"
        >
          <img
            src={currentUser?.photoUrl || "/default-profile.png"}
            alt="profile"
            className="h-24 w-24 rounded-full cursor-pointer object-cover border-2 border-gray-300 shadow-md hover:shadow-lg transition-all"
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="emailId"
            placeholder="Email"
            className="bg-gray-200 rounded-lg w-full p-3 outline-none cursor-not-allowed"
            value={formData.emailId}
            disabled
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={formData.age}
            onChange={handleChange}
          />
          <select
            name="gender"
            className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <button
            type="button"
            className="text-blue-600 underline focus:outline-none transition-all hover:text-blue-800"
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
                className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                value={formData.password}
                onChange={handleChange}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="bg-gray-50 rounded-lg w-full p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </>
          )}

          <button
            type="submit"
            className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
