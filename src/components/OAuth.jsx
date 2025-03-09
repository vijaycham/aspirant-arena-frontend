import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";
import axios from "axios";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/authSlice";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Extract first and last name
      const fullName = result.user.displayName?.trim() || "User"; // Default to "User" if empty
      const nameParts = fullName.split(" ").filter(Boolean); // Remove empty strings
      const firstName = nameParts.at(0)?.trim() || "User"; // Ensure a fallback first name
      const lastName = nameParts.slice(1).join(" ").trim() || ""; // Optional last name

      const res = await axios.post(
        `${API_URL}/api/auth/google`,
        {
          idToken,
          firstName,
          lastName,
          emailId: result.user.email,
          photoURL: result.user.photoURL,
        },
        { withCredentials: true }
      );
      const { userProfile } = res.data;
      dispatch(signInSuccess(res.data.userProfile));
      navigate("/");
    } catch (error) {
      console.error("Google Sign In error", error);
    }
  };
  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className=" flex gap-16 h-10 overflow-hidden items-center text-black p-3 rounded-lg uppercase shadow-sm border border-gray-100 hover:shadow-xl transition duration-300 w-full"
      >
        <div className="bg-white p-2">
          <img
            className=" w-10 h-10 object-contain"
            src="https://logos-world.net/wp-content/uploads/2020/09/Google-Symbol.png"
            alt="Google logo"
          />
        </div>
        <span className="font-medium text-gray-700">Continue with Google</span>
      </button>
    </div>
  );
};

export default OAuth;
