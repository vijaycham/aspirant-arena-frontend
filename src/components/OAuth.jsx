import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";
import api from "../utils/api";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/authSlice";
import { useNavigate } from "react-router-dom";


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

      const res = await api.post("/auth/google", {
        idToken,
        firstName,
        lastName,
        emailId: result.user.email,
        photoURL: result.user.photoURL,
      });

      dispatch(signInSuccess(res.userProfile));
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
        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-white text-slate-900 font-bold border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all active:scale-95"
      >
        <img
          className="w-5 h-5 object-contain"
          src="https://logos-world.net/wp-content/uploads/2020/09/Google-Symbol.png"
          alt="Google logo"
        />
        <span className="text-sm">Continue with Google</span>
      </button>
    </div>
  );
};

export default OAuth;
