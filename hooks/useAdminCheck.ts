// hooks/useAdminCheck.ts
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ADMIN_UID = "Tyn3HhJaOQTCZFXjEclKHCOx0bu1";

export function useAdminCheck() {
  const [status, setStatus] = useState<
    "loading" | "unauthorized" | "authorized"
  >("loading");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.uid === ADMIN_UID) {
        setStatus("authorized");
      } else {
        setStatus("unauthorized");
      }
    });

    return () => unsubscribe();
  }, []);

  return status;
}
