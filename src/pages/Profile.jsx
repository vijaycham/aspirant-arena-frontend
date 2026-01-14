import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef, useCallback } from "react";
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
import imageCompression from "browser-image-compression";


const Profile = () => {
  const fileRef = useRef(null);
  const [image, setImage] = useState(undefined);
  const [imagePercentage, setImagePercentage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;
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
        if (res.status === "success") {
          dispatch(updateProfile(res.data.user));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [dispatch, userId]); 

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
      setPreviewImage(currentUser.photoUrl || "");
    }
  }, [currentUser]);

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    setImageError(false);
    setImagePercentage(0);

    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const storage = getStorage(app);
      const userId = currentUser?._id || currentUser?.id;
      
      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        return;
      }

      const fileName = `profile-${userId}.jpg`;
      const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, compressedFile, {
        contentType: "image/jpeg",
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImagePercentage(Math.round(progress));
        },
        (error) => {
          setImageError(true);
          console.error("Upload Error:", error);
          toast.error("Image upload failed. Please try again.");
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setPreviewImage(downloadURL);
            setFormData((prev) => ({ ...prev, photoUrl: downloadURL }));
            setImagePercentage(100);
          } catch (error) {
            console.error("Error getting download URL:", error);
            setImageError(true);
          }
        }
      );
    } catch (error) {
      console.error("Compression Error:", error);
      setImageError(true);
      toast.error("Failed to process image.");
    }
  }, [currentUser?._id, currentUser?.id]);

  useEffect(() => {
    if (image) {
      handleFileUpload(image);
    }
  }, [image, handleFileUpload]);

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 relative overflow-hidden font-outfit">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary-500/10 blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-slate-900/80 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">My Profile</h1>
          <p className="text-gray-400 font-medium text-sm">Manage your personal information and security</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-6"
        >
          <input
            type="file"
            ref={fileRef}
            hidden
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          
          <div className="relative group cursor-pointer" onClick={() => fileRef.current.click()}>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
            <img
              src={previewImage || currentUser?.photoUrl || "/default-profile.png"}
              alt="profile"
              className="relative h-28 w-28 rounded-full object-cover border-4 border-slate-900 shadow-xl group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-lg border-4 border-slate-900 group-hover:scale-110 transition-transform">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
          </div>

          <p className="text-sm font-medium h-5">
            {imageError ? (
              <span className="text-rose-500 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 File size must be less than 2MB
              </span>
            ) : imagePercentage > 0 && imagePercentage < 100 ? (
              <span className="text-primary-400 animate-pulse">{`Uploading: ${imagePercentage}%`}</span>
            ) : imagePercentage === 100 ? (
              <span className="text-emerald-400 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                 Image uploaded successfully
              </span>
            ) : (
              " "
            )}
          </p>

          <div className="w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  className="w-full px-5 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  className="w-full px-5 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                name="emailId"
                placeholder="Email"
                className="w-full px-5 py-3 rounded-xl bg-slate-800/30 border border-white/5 text-gray-400 cursor-not-allowed opacity-70"
                value={formData.emailId}
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Age</label>
                <input
                  type="number"
                  name="age"
                  placeholder="25"
                  className="w-full px-5 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Gender</label>
                <select
                  name="gender"
                  className="w-full px-5 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all appearance-none"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male" className="bg-slate-900">Male</option>
                  <option value="Female" className="bg-slate-900">Female</option>
                  <option value="Other" className="bg-slate-900">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-2"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
              >
                 {showPasswordFields ? (
                   <>
                     <span className="text-rose-400">
                       Cancel {currentUser?.hasPassword ? "Password Update" : "Password Setup"}
                     </span>
                   </>
                 ) : (
                   <>
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                     {currentUser?.hasPassword ? "Change Password" : "Set Password"}
                   </>
                 )}
              </button>

              {showPasswordFields && (
                <div className="mt-4 space-y-4 animate-fadeIn">
                  <input
                    type="password"
                    name="password"
                    placeholder="New Password"
                    className="w-full px-5 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    className="w-full px-5 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-gray-500 focus:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full mt-6">
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-[1.01] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                loading ||
                imageError ||
                JSON.stringify(formData) === JSON.stringify(currentUser)
              }
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Updating...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
