import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import "./theme.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const makeStars = () =>
  Array.from({ length: 140 }, (_, id) => {
    const size = Math.random() * 2 + 1;
    return {
      id,
      size,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 5,
    };
  });

const makeOrbs = () =>
  Array.from({ length: 4 }, (_, id) => ({
    id,
    size: Math.random() * 200 + 150,
    top: Math.random() * 80,
    left: Math.random() * 80,
    duration: Math.random() * 10 + 15,
    purple: id % 2 !== 0,
  }));

const makeParticles = () =>
  Array.from({ length: 20 }, (_, id) => ({
    id,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
  }));

function AuthBackground() {
  const stars = useMemo(makeStars, []);
  const orbs = useMemo(makeOrbs, []);
  const particles = useMemo(makeParticles, []);

  return (
    <div className="prometheus-auth-fx" aria-hidden="true">
      {stars.map((star) => (
        <span key={`star-${star.id}`} className="prometheus-auth-star" style={{ width: `${star.size}px`, height: `${star.size}px`, top: `${star.top}%`, left: `${star.left}%`, "--duration": `${star.duration}s`, animationDelay: `${star.delay}s` }} />
      ))}
      {orbs.map((orb) => (
        <span key={`orb-${orb.id}`} className="prometheus-auth-orb" style={{ width: `${orb.size}px`, height: `${orb.size}px`, top: `${orb.top}%`, left: `${orb.left}%`, "--duration": `${orb.duration}s`, background: orb.purple ? "var(--prometheus-auth-purple)" : "var(--prometheus-auth-blue)" }} />
      ))}
      {particles.map((particle) => (
        <span key={`particle-${particle.id}`} className="prometheus-auth-particle" style={{ width: `${particle.size}px`, height: `${particle.size}px`, left: `${particle.left}%`, "--duration": `${particle.duration}s`, animationDelay: `${particle.delay}s` }} />
      ))}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg className="prometheus-auth-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1.8 1.6 2.8 1.1.1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0C17.6 4.5 18.6 4.8 18.6 4.8c.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7A19.9 19.9 0 0 0 24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7A19.9 19.9 0 0 0 24 4C16.3 4 9.6 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.2-5.2A11.9 11.9 0 0 1 12.9 28l-6.6 5.1C9.6 39.6 16.3 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.2 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z" />
    </svg>
  );
}

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const screenRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!screenRef.current) return;
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      screenRef.current.style.setProperty("--mouse-x", `${x}%`);
      screenRef.current.style.setProperty("--mouse-y", `${y}%`);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSignup = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      alert("Enter a valid email address.");
      return;
    }

    if (password.trim().length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/signup`, {
        email: normalizedEmail,
        password,
      });

      if (!localStorage.getItem("prometheus_signup_date")) {
        localStorage.setItem("prometheus_signup_date", new Date().toISOString());
      }
      localStorage.setItem("prometheus_username", normalizedEmail);

      alert("Account created");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div ref={screenRef} className="prometheus-auth-screen">
      <AuthBackground />

      <header className="prometheus-auth-header">
        <a href="/dashboard" className="prometheus-auth-logo">
          <span className="prometheus-auth-logo-mark"><span /></span>
          <span className="prometheus-auth-logo-text">Prometheus</span>
        </a>
        <a href="/dashboard" className="prometheus-auth-back">Back to main site &rarr;</a>
      </header>

      <main className="prometheus-auth-main">
        <section className="prometheus-auth-panel">
          <div className="prometheus-auth-intro">
            <h2>Secure Your <span>Future</span></h2>
            <p>Create your account to access your neural assistant and survival tasks.</p>
          </div>

          <div className="prometheus-auth-card">
            <div className="prometheus-auth-card-glow" />
            <form className="prometheus-auth-form" onSubmit={handleSignup}>
              <div>
                <label htmlFor="email">Email Address</label>
                <input id="email" type="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>

              <button type="submit" className="prometheus-auth-submit">
                <span>Create Account</span>
                <ArrowIcon />
              </button>
            </form>

            <div className="prometheus-auth-divider">
              <span />
              <strong>Or continue with</strong>
            </div>

            <div className="prometheus-auth-socials">
              <button type="button"><GithubIcon /><span>GitHub</span></button>
              <button type="button"><GoogleIcon /><span>Google</span></button>
            </div>
          </div>

          <p className="prometheus-auth-switch">
            Already have access? <a href="/login">Sign in</a>
          </p>
        </section>
      </main>

      <div className="prometheus-auth-bottom-line" />
    </div>
  );
}

export default Signup;
