import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";
import axios from "axios";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);

      // Extract first and last name
      const fullName = result.user.displayName?.trim() || "User"; // Default to "User" if empty
      const nameParts = fullName.split(" ").filter(Boolean); // Remove empty strings
      const firstName = nameParts.at(0)?.trim() || "User"; // Ensure a fallback first name
      const lastName = nameParts.slice(1).join(" ").trim() || ""; // Optional last name

      const idToken = await result.user.getIdToken();

      const res = await axios.post("http://localhost:8888/api/auth/google", {
        idToken,
        firstName,
        lastName,
        emailId: result.user.email,
        photoURL: result.user.photoURL,
      });

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
        className="bg-red-700 text-white p-2 rounded-lg uppercase hover:bg-red-600 w-full"
      >
        continue with google
      </button>
    </div>
  );
};

export default OAuth;
