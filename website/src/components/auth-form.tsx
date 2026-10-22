"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./auth-form.module.css";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const signup = mode === "signup";
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  async function googleSignIn() {
    setMessage(""); setFailed(false); setGoogleBusy(true);
    try {
      const client = createClient();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Unable to connect to sign-in. Please try again.");
      const settingsData = await response.json();
      if (!settingsData.external?.google) throw new Error("Google sign-in is not available yet. Please use email and password for now.");
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: "select_account" } },
      });
      if (error) throw error;
    } catch (error) {
      setFailed(true); setMessage(error instanceof Error ? error.message : "Google sign-in failed. Please try again."); setGoogleBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setFailed(false);
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email")).trim();
    const password = String(fields.get("password"));
    const phone = String(fields.get("phone") ?? "").trim().replace(/[\s().-]/g, "");
    if (signup && phone && !/^\+?[0-9]{7,15}$/.test(phone)) {
      setFailed(true); setMessage("Enter a valid phone number with 7–15 digits, including your country code."); return;
    }
    if (signup && password !== fields.get("confirm")) { setFailed(true); setMessage("Your passwords do not match."); return; }
    setBusy(true);
    try {
      const client = createClient();
      if (signup) {
        const { data, error } = await client.auth.signUp({ email, password, options: {
          data: { full_name: String(fields.get("name")).trim(), phone_number: phone || null },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        } });
        if (error) throw error;
        if (data.session) { router.replace("/account"); router.refresh(); return; }
        setMessage("Check your email for a confirmation link. Open it in this browser to finish creating your account. If you already have an account, sign in below.");
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw new Error("Could not sign in. Check your email and password, and confirm your email if required.");
        router.replace("/auth/redirect"); router.refresh();
      }
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }

  return <main className={styles.page}>
    <section className={styles.story}>
      <Link href="/" className={styles.wordmark} aria-label="Authéra homepage"><Image src="/brand/authera-logo.png" alt="Authéra Skincare" width={1983} height={793} priority /></Link>
      <div><p className={styles.eyebrow}>YOUR EVERYDAY RITUAL</p><h1>A little care.<br />All yours.</h1><p>Discover your favorite brands and make space for the things that feel good.</p><span className={styles.flower} aria-hidden="true">✳</span></div>
      <Link href="/">← Back to the collection</Link>
    </section>
    <section className={styles.panel}>
      <nav className={styles.tabs} aria-label="Account access"><Link href="/signin" aria-current={!signup ? "page" : undefined}>Log in</Link><Link href="/signup" aria-current={signup ? "page" : undefined}>Create account</Link></nav>
      <div className={styles.content}><p className={styles.eyebrow}>WELCOME TO AUTHÉRA</p><h2>{signup ? "Your care starts here." : "Lovely to see you again."}</h2><p className={styles.subtitle}>{signup ? "Create your account in a few simple steps." : "Log in to your Authéra account."}</p>
        <button type="button" className={styles.google} disabled={busy || googleBusy} onClick={googleSignIn}>
          <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.85 23.85 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>
          {googleBusy ? "Connecting to Google…" : "Continue with Google"}
        </button>
        <div className={styles.divider}><span>or continue with email</span></div>
        <form onSubmit={submit} className={styles.form}>
          {signup && <label>Full name<input name="name" autoComplete="name" required maxLength={100} placeholder="Your name" /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
          {signup && <label>Phone number (optional)<input name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={30} placeholder="e.g. +880 1712 345678" aria-describedby="phone-note" /><span id="phone-note" style={{ fontWeight: 400, lineHeight: 1.5 }}>Include your country code. Saved as your contact number.</span></label>}
          <label>Password<span className={styles.password}><input name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} maxLength={128} required placeholder={signup ? "At least 8 characters" : "Enter your password"} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={19}/> : <Eye size={19}/>}</button></span></label>
          {signup && <label>Confirm password<input name="confirm" type={visible ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} required placeholder="Enter your password again" /></label>}
          {message && <p className={failed ? styles.error : styles.success} role={failed ? "alert" : "status"}>{message}</p>}
          <button className={styles.submit} disabled={busy || googleBusy}>{busy ? "Please wait…" : signup ? "Create account" : "Log in"}<ArrowRight size={18}/></button>
        </form>
        <p className={styles.switch}>{signup ? "Have an account?" : "New to Authéra?"} <Link href={signup ? "/signin" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link></p>
        <p className={styles.secure}><ShieldCheck size={17}/> Secure account access</p>
      </div>
    </section>
  </main>;
}
