import { useEffect, useState } from "react";

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

type UseMidtransResult = {
  isMidtransReady: boolean;
  clientKey?: string;
};

const useMidtrans = (): UseMidtransResult => {
  const [isMidtransReady, setIsMidtransReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as unknown as { snap?: unknown }).snap) {
      setIsMidtransReady(true);
      return;
    }

    if (!CLIENT_KEY) {
      console.warn(
        "NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is missing; cannot load Snap script"
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", CLIENT_KEY);
    script.onload = () => setIsMidtransReady(true);
    script.onerror = () => setIsMidtransReady(false);

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return { isMidtransReady, clientKey: CLIENT_KEY };
};

export { useMidtrans };
export default useMidtrans;
