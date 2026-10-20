"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function SignOut() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  return <><button style={{ padding: "10px 24px", border: "1px solid #512c3c", cursor: "pointer" }} onClick={async () => {
    const { error } = await createClient().auth.signOut();
    if (error) { setMessage("Could not sign out. Please try again."); return; }
    router.replace("/signin"); router.refresh();
  }}>Sign out</button><p role="status">{message}</p></>;
}
