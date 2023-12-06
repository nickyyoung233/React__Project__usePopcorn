import { useEffect } from "react";

export const useKeyPress = (key, action) => {
  useEffect(() => {
    function keyUpHandler(e) {
      if (e.code.toLowerCase() === key.toLowerCase()) {
        action();
      }
    }
    document.addEventListener("keyup", keyUpHandler);
    return () => document.removeEventListener("keyup", keyUpHandler);
  }, [key, action]);
};
