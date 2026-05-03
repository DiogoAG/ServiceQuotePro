import { useUser } from "@/firebase";
import { useEffect, useState } from "react";

/**
 * Hook to determine if the current session is a demo session.
 */
export function useDemoMode() {
  const { user } = useUser();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const demoFlag = localStorage.getItem("service_quote_pro_is_demo") === "true";
      // We also verify the user is anonymous to be safe
      setIsDemo(demoFlag && (user?.isAnonymous || false));
    }
  }, [user]);

  const enterDemoMode = () => {
    localStorage.setItem("service_quote_pro_is_demo", "true");
  };

  const exitDemoMode = () => {
    localStorage.removeItem("service_quote_pro_is_demo");
  };

  return { isDemoMode: isDemo, enterDemoMode, exitDemoMode };
}
