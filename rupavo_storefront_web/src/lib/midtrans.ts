import midtransClient from "midtrans-client";

// Client key is safe to expose; server key must remain on the backend only.
const clientKey =
  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ??
  process.env.MIDTRANS_CLIENT_KEY;
const serverKey =
  process.env.MIDTRANS_SERVER_KEY ??
  process.env.NEXT_PUBLIC_MIDTRANS_SERVER_KEY ??
  process.env.NEXT_PUBLIC_MIDTRANS_SERVERY_KEY ??
  process.env.SERVER_KEY;
const baseAppUrl = process.env.BASE_URL;

if (!clientKey) {
  throw new Error("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is not set");
}

if (!serverKey) {
  throw new Error(
    "MIDTRANS_SERVER_KEY (or NEXT_PUBLIC_MIDTRANS_SERVER_KEY/NEXT_PUBLIC_SERVERY_KEY/SERVER_KEY) is not set"
  );
}

const midtransSnap = new midtransClient.Snap({
  isProduction: false,
  serverKey,
  clientKey,
});

export {
  midtransSnap,
  baseAppUrl as midtransBaseUrl,
  clientKey as midtransClientKey,
};
