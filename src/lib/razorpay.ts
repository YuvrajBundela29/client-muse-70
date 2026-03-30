import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(script);
  });
}

interface PaymentOptions {
  amount: number; // in INR (not paise)
  planName: string;
  credits?: number;
  onSuccess: (data: any) => void;
  onFailure: (error: string) => void;
}

export async function initiatePayment({ amount, planName, credits, onSuccess, onFailure }: PaymentOptions) {
  try {
    await loadRazorpayScript();

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error("Not authenticated");

    // Create order via edge function
    const { data, error } = await supabase.functions.invoke("create-order", {
      body: { amount, planName, credits },
    });

    if (error || !data?.success) {
      throw new Error(data?.error || error?.message || "Failed to create order");
    }

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "AutoClient AI",
      description: planName,
      order_id: data.orderId,
      prefill: {
        name: data.userName,
        email: data.userEmail,
      },
      theme: { color: "#5B5FEF" },
      handler: async (response: any) => {
        try {
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
            body: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planName,
              credits,
              amount,
            },
          });

          if (verifyError || !verifyData?.success) {
            onFailure(verifyData?.error || verifyError?.message || "Verification failed");
          } else {
            onSuccess(verifyData);
          }
        } catch (err: any) {
          onFailure(err.message);
        }
      },
      modal: {
        ondismiss: () => onFailure("Payment cancelled"),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err: any) {
    onFailure(err.message);
  }
}
