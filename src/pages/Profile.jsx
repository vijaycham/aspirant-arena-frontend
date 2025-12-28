import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { updateProfile } from "../redux/user/authSlice";
import api from "../utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";


const Profile = () => {
  const fileRef = useRef(null);
  const [image, setImage] = useState(undefined);
  const [imagePercentage, setImagePercentage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [previewImage, setPreviewImage] = useState(currentUser?.photoUrl || "");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    age: "",
    gender: "Other",
    password: "",
    confirmPassword: "",
    photoUrl: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        dispatch(updateProfile(res.data.user));
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (!currentUser) {
      fetchProfile();
    }
  }, []);

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        emailId: currentUser.emailId || "",
        age: currentUser.age || "",
        gender: currentUser.gender || "Other",
        password: "",
        confirmPassword: "",
        photoUrl: currentUser.photoUrl || "",
      });
    }
  }, [currentUser]);

  const handleFileUpload = async (image) => {
    if (!image) return;
    setImageError(false);

    if (image.size > 2 * 1024 * 1024) {
      setImageError(true);
      return;
    }
    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePercentage(Math.round(progress));
      },
      (error) => {
        setImageError(true);
        console.error("Upload Error:", error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          setPreviewImage(downloadURL);
          // Update formData state
          setFormData((prev) => ({ ...prev, photoUrl: downloadURL }));
        } catch (error) {
          console.error("Error updating profile with new image:", error);
          setImageError(true);
        }
      }
    );
  };

  useEffect(() => {
    if (image) {
      handleFileUpload(image);
    }
  }, [image]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (showPasswordFields && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        ...formData,
      };
      if (!showPasswordFields) {
        delete updateData.password;
      }

      const res = await api.put("/profile", updateData);

      if (res.status === "success") {
        dispatch(updateProfile(res.data.user)); // ✅ Update Redux only on success
        setFormData((prev) => ({ ...prev, ...res.data.user })); // ✅ Update local state
        toast.success("Profile updated successfully!");
        setImagePercentage(0);
      } else {
        throw new Error(res.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "An error occurred.");
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
          <input
            type="file"
            ref={fileRef}
            hidden
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <img
            src={
              previewImage || currentUser?.photoUrl || "/default-profile.png"
            }
            alt="profile"
            className="h-24 w-24 rounded-full cursor-pointer object-cover border-2 border-gray-300 shadow-md hover:shadow-lg transition-all"
            onClick={() => fileRef.current.click()}
          />
          <p className="text-sm self-ceq">
            {imageError ? (
              <span className="text-red-700">
                Error uploading image(file size must be less than 2MB)
              </span>
            ) : imagePercentage > 0 && imagePercentage < 100 ? (
              <span className="text-slate-700">{`Uploading: ${imagePercentage}%`}</span>
            ) : imagePercentage === 100 ? (
              <span className="text-green-700">
                Image uploaded successfully
              </span>
            ) : (
              // ) : previewImage === "" ? (
              //   <span className="text-green-700">Image removed successfully</span>
              " "
            )}
          </p>
          {/* {previewImage && (
            <button
              type="button"
              onClick={() => {
                setPreviewImage("");
                setFormData((prev) => ({
                  ...prev,
                  photoUrl: "",
                }));
                fileRef.current.value = null;
              }}
              className="text-red-600 underline text-sm hover:text-red-800"
            >
              Remove Picture
            </button>
          )} */}

          <div className="flex w-full gap-3 rounded-lg">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="shadow-sm border border-gray-300 rounded-lg w-1/2 p-2 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className=" shadow-sm border border-gray-300 rounded-lg w-1/2 p-2 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <input
            type="email"
            name="emailId"
            placeholder="Email"
            className="bg-gray-100 rounded-lg w-full p-2 outline-none cursor-not-allowed"
            value={formData.emailId}
            disabled
          />
          <div className="flex w-full gap-3 rounded-lg">
            <input
              type="number"
              name="age"
              placeholder="Age"
              className="shadow-sm border border-gray-300 rounded-lg w-full p-2 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              value={formData.age}
              onChange={handleChange}
            />
            <select
              name="gender"
              className="shadow-sm border border-gray-300 rounded-lg w-full p-2 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
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
          <div className="flex gap-10 ">
            <button
              type="submit"
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={
                loading ||
                imageError ||
                JSON.stringify(formData) === JSON.stringify(currentUser)
              }
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
            {/* <button
              type="submit"
              className={`bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              Delete Account
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
