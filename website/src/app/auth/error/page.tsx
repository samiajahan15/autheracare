import Link from "next/link";
export default function AuthError() { return <main style={{ maxWidth: 550, margin: "80px auto", padding: 24, lineHeight: 1.8 }}><h1>We couldn’t finish signing you in</h1><p>Sign-in may have been cancelled, or your confirmation link may have expired. Please try again in the browser where you started.</p><Link href="/signin">Return to log in</Link></main>; }
