import {
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { AuthUser } from "./interfaces/google-auth.interface";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const tokenId = await user.getIdToken();

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      tokenId,
    };
  } catch (error) {
    console.error("Error en signInWithGoogle:", error);
    throw new Error("Error al iniciar sesión con Google");
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error en signOut:", error);
    throw new Error("Error al cerrar sesión");
  }
};
