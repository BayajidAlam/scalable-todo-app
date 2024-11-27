import { createContext, useEffect, useState, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  User,
  UserCredential,
} from "firebase/auth";
import { app } from "../firebase/firebase.config";
import axios from "axios";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  createUser: (email: string, password: string) => Promise<UserCredential>;
  logInUser: (email: string, password: string) => Promise<UserCredential>;
  logOutUser: () => Promise<void>;
}

// creating auth
export const AuthContext = createContext<AuthContextProps | null>(null);
const auth = getAuth(app);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  // states
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // functions
  const createUser = (email: string, password: string) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logInUser = (email: string, password: string) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setLoading(true);

    if (!user) {
      throw new Error("No user is currently logged in");
    }

    // reauthenticate the user
    const credential = EmailAuthProvider.credential(
      // @ts-ignore
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // then update the password
    try {
      await updatePassword(user, newPassword);
      console.log("Password updated successfully");
    } catch (error) {
      console.error("Failed to update password:", error);
    } finally {
      setLoading(false);
    }
  };

  const logOutUser = () => {
    setLoading(true);
    return signOut(auth);
  };

  // observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        axios
          .post(`${import.meta.env.VITE_API_URL}/jwt`, {
            email: currentUser?.email,
          })
          .then((data) => {
            console.log(currentUser, "currentUser");
            localStorage.setItem("access-token", data.data.token);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Axios request failed:", error);
          });
      } else {
        localStorage.removeItem("access-token");
        setLoading(false);
      }
    });

    return () => {
      return unsubscribe();
    };
  }, []);

  const authInfo = {
    user,
    loading,
    createUser,
    logInUser,
    changePassword,
    logOutUser,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
