import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  Leaf,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

const links = [
  { to: "/about", label: "About me" },
  { to: "/services", label: "Services & rates" },
  { to: "/book", label: "Book a sitting" },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Thoughtful Childcare home">
          <span className="brand-mark"><Leaf size={19} strokeWidth={1.7} /></span>
          <span className="brand-name">little <i>nest</i></span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              {link.label}
            </NavLink>
          ))}
          <Link className="button button-small button-dark nav-cta" to="/book">
            Let’s talk <ArrowRight size={15} />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link to="/" className="brand footer-brand">
            <span className="brand-mark"><Leaf size={18} strokeWidth={1.7} /></span>
            <span className="brand-name">little <i>nest</i></span>
          </Link>
          <p>Care that feels like a breath of fresh air.</p>
        </div>
        <div className="footer-links">
          <Link to="/about">A little about me</Link>
          <Link to="/services">Services & rates</Link>
          <Link to="/book">Request a sitting</Link>
          <Link to="/policies">Policies & privacy</Link>
          <Link to="/admin" className="admin-link"><LockKeyhole size={13} /> Private admin</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Thoughtful childcare · Phoenix, Arizona</span>
        <span>Made with care <Heart size={12} fill="currentColor" /></span>
      </div>
    </footer>
  );
}

function HomePage() {
  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> A little more ease for your family</div>
            <h1>Thoughtful,<br />reliable <em>childcare.</em></h1>
            <p className="hero-lede">
              A caring, capable extra pair of hands—so your little ones feel at home, and you can feel good about stepping out.
            </p>
            <div className="hero-actions">
              <Link to="/book" className="button button-dark">Book a sitting <ArrowRight size={16} /></Link>
              <Link to="/about" className="text-link">Get to know me <ArrowRight size={15} /></Link>
            </div>
            <div className="hero-note">
              <div className="avatar-stack" aria-hidden="true">
                <span>♡</span><span>✿</span><span>☼</span>
              </div>
              <span>Gentle care, grounded in experience</span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-photo"
              src="https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=1200&q=85"
              alt="Sunlit green garden, a peaceful place for little adventures"
            />
            <div className="photo-caption"><span className="caption-icon"><Sparkles size={16} /></span><span>A safe space to play, learn & grow</span></div>
            <div className="hero-sticker" aria-label="A little kindness goes a long way">
              <span>✳</span><small>a little<br />kindness goes<br />a long way</small>
            </div>
          </div>
          <a className="scroll-cue" href="#welcome"><ArrowDown size={14} /> A little more</a>
        </section>

        <section id="welcome" className="welcome-section section-wrap">
          <div className="welcome-label"><span>01</span> A warm hello</div>
          <div className="welcome-copy">
            <h2>For the days when<br />you need <em>a village.</em></h2>
            <div>
              <p>I believe good childcare is about more than keeping little ones busy. It’s creating a safe, engaging, and nurturing space where each child feels seen.</p>
              <p>Whether you need a few hours to recharge or a regular helping hand, I’d love to learn what your family needs.</p>
              <Link to="/about" className="underlined-link">A little more about me <ArrowRight size={15} /></Link>
            </div>
          </div>
        </section>

        <section className="experience-band">
          <div className="section-wrap experience-inner">
            <div className="experience-heading">
              <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Care with intention</span>
              <h2>Little ones are<br />in <em>good hands.</em></h2>
              <Link to="/about" className="button button-light">My experience <ArrowRight size={15} /></Link>
            </div>
            <div className="experience-list">
              <div className="experience-item"><span className="experience-icon"><Heart size={19} /></span><div><h3>Preschool experience</h3><p>Two years supporting little learners through their earliest big adventures.</p></div><b>01</b></div>
              <div className="experience-item"><span className="experience-icon"><Sparkles size={19} /></span><div><h3>Learning & movement</h3><p>Grade-school tutoring and assistant dance teaching bring play and curiosity into the mix.</p></div><b>02</b></div>
              <div className="experience-item"><span className="experience-icon"><ShieldCheck size={19} /></span><div><h3>Safety comes first</h3><p>Fingerprint clearance card, a calm presence, and care tailored to your child.</p></div><b>03</b></div>
            </div>
          </div>
        </section>

        <section className="rate-section section-wrap">
          <div className="rate-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> Simple & transparent</span>
            <h2>Good care,<br /><em>fairly priced.</em></h2>
            <p>Thoughtful care should feel straightforward. My starting rate is for one child; I’ll confirm the total with you based on your family’s needs.</p>
            <Link to="/services" className="underlined-link">See services & rates <ArrowRight size={15} /></Link>
          </div>
          <div className="rate-card">
            <span className="rate-card-label">A little breathing room</span>
            <div className="rate-amount"><sup>$</sup>22<span>/ hour</span></div>
            <div className="rate-rule" />
            <div className="rate-detail"><span>One child</span><Check size={15} /></div>
            <div className="rate-detail"><span>Additional children</span><span className="rate-custom">Let’s chat</span></div>
            <Link to="/book" className="button button-dark button-full">Request a sitting <ArrowRight size={15} /></Link>
            <small>Final pricing and availability are confirmed personally.</small>
          </div>
          <span className="rate-flower" aria-hidden="true">✳</span>
        </section>

        <section className="kind-words">
          <div className="section-wrap kind-inner">
            <span className="eyebrow"><span className="eyebrow-dot" /> Kind words</span>
            <div className="kind-content">
              <span className="quote-mark">“</span>
              <div><h2>The best care begins<br />with <em>a conversation.</em></h2><p>Reviews will be shared here with permission from families. Your trust—and your child’s privacy—come first.</p></div>
            </div>
            <span className="review-note"><span className="review-dot" /> Real families. Real words. Always shared with permission.</span>
          </div>
        </section>

        <section className="steps-section section-wrap">
          <div className="steps-heading"><span className="eyebrow"><span className="eyebrow-dot" /> Easy as one, two, three</span><h2>A lovely little<br /><em>plan.</em></h2><p>Getting started is simple. We’ll take it one step at a time.</p></div>
          <div className="steps-list">
            <div className="step-card"><div className="step-number">01</div><div className="step-icon"><CalendarDays size={21} /></div><h3>Tell me what you need</h3><p>Share your preferred date, timing, and a little about your family.</p></div>
            <div className="step-card"><div className="step-number">02</div><div className="step-icon"><Heart size={21} /></div><h3>Let’s make a plan</h3><p>I’ll get back to you to confirm availability and talk through the details.</p></div>
            <div className="step-card"><div className="step-number">03</div><div className="step-icon"><Sparkles size={21} /></div><h3>Enjoy your time</h3><p>Once we’ve confirmed everything, you can head out with peace of mind.</p></div>
          </div>
        </section>
        <section className="closing-cta">
          <div className="closing-deco">✳</div>
          <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Your family, your rhythm</span>
          <h2>A little help can<br />go <em>a long way.</em></h2>
          <p>Tell me what your family needs. We’ll take it from there.</p>
          <Link to="/book" className="button button-light">Let’s find a time <ArrowRight size={15} /></Link>
        </section>
      </main>
    </>
  );
}

function AboutPage() {
  return (
    <main className="inner-page">
      <section className="page-intro">
        <span className="eyebrow"><span className="eyebrow-dot" /> A little about me</span>
        <h1>Care is a feeling<br />as much as <em>an action.</em></h1>
        <p>Hi, I’m your neighborhood babysitter. I’m a college student studying neuroscience, and I love helping children feel safe, curious, and cared for.</p>
      </section>
      <section className="about-story section-wrap">
        <div className="about-art"><div className="about-art-inner"><span>✳</span><p>Curiosity<br />lives here.</p><small>Little minds, big wonder</small></div></div>
        <div className="about-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> The person behind the care</span>
          <h2>A nurturing space<br />for <em>growing minds.</em></h2>
          <p>For two years, I worked as a preschool teacher—learning that every child has their own way of seeing the world, and that the small moments matter most. I’ve also worked as a grade-school tutor and an assistant dance teacher, bringing patience, creativity, and a sense of play to time together.</p>
          <p>As a neuroscience student, I’m endlessly interested in how children grow and learn. As a caregiver, I believe that starts with making each child feel secure, respected, and free to be themselves.</p>
          <p>I hold a fingerprint clearance card and value a thoughtful partnership with every family. I’m here to listen, follow your routines, and make your child’s time with me feel like their own.</p>
          <Link to="/book" className="button button-dark">Let’s get acquainted <ArrowRight size={15} /></Link>
        </div>
      </section>
      <section className="values-strip"><div><ShieldCheck /><h3>Safety-minded</h3><p>A calm, prepared presence and respect for your family’s routines.</p></div><div><Sparkles /><h3>Curiosity-led</h3><p>Play, learning, and little adventures at your child’s pace.</p></div><div><Heart /><h3>Child-centered</h3><p>Patient, warm support that makes room for every personality.</p></div></section>
    </main>
  );
}

function ServicesPage() {
  const [children, setChildren] = useState(1);
  const [hours, setHours] = useState(3);
  const estimate = children === 1 ? 22 * hours : null;

  return (
    <main className="inner-page">
      <section className="page-intro">
        <span className="eyebrow"><span className="eyebrow-dot" /> Services & rates</span>
        <h1>Good care, made<br /><em>simple.</em></h1>
        <p>From a few hours to an evening out, I’ll work with you to find the right fit for your family.</p>
      </section>
      <section className="services-grid section-wrap">
        <article className="service-card service-feature">
          <span className="service-icon"><Heart size={21} /></span><span className="eyebrow">01 / Babysitting</span>
          <h2>Thoughtful care<br />for little ones.</h2><p>Playtime, snack time, stories, and all the in-between moments. Care follows your child’s rhythm and the routines that help them feel at home.</p>
          <div className="service-price"><strong>$22</strong><span>per hour<br />for one child</span></div>
        </article>
        <article className="service-card service-soft">
          <span className="service-icon"><Sparkles size={21} /></span><span className="eyebrow">02 / More little ones</span>
          <h2>Every family is<br /><em>a little different.</em></h2><p>Additional-child pricing is set personally, not guessed. Tell me how many children need care, and I’ll confirm a rate with you before anything is booked.</p>
          <span className="service-contact">Custom quote, no surprises</span>
        </article>
      </section>
      <section className="estimator-wrap section-wrap">
        <div className="estimator-copy"><span className="eyebrow"><span className="eyebrow-dot" /> A helpful starting point</span><h2>What might it<br /><em>look like?</em></h2><p>Try the estimator for a one-child sitting. For more than one child, I’ll share a personalized estimate after you reach out.</p></div>
        <form className="estimator-card" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="estimate-children">Number of children</label>
          <div className="select-wrap"><select id="estimate-children" value={children} onChange={(event) => setChildren(Number(event.target.value))}><option value={1}>1 child</option><option value={2}>2 children</option><option value={3}>3 children</option><option value={4}>4+ children</option></select><ChevronDown size={16} /></div>
          <label htmlFor="estimate-hours">Requested hours</label>
          <div className="range-row"><input id="estimate-hours" type="range" min="1" max="12" value={hours} onChange={(event) => setHours(Number(event.target.value))} /><output htmlFor="estimate-hours">{hours} hrs</output></div>
          <div className="estimate-total"><span>Estimated total</span><strong>{estimate === null ? "Let’s chat" : `$${estimate}`}</strong></div>
          <p className="estimate-disclaimer">{estimate === null ? "I’ll confirm additional-child pricing with you personally." : "Based on $22/hour for one child. Final pricing and availability are confirmed personally."}</p>
          <Link to="/book" className="button button-dark button-full">Request a sitting <ArrowRight size={15} /></Link>
        </form>
      </section>
    </main>
  );
}

function BookingPage() {
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [childrenCount, setChildrenCount] = useState("1");
  const oneChildEstimate = childrenCount === "1";
  const todayPhoenix = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix" }).format(new Date());

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    if (!supabase) {
      setResult({ ok: false, message: "Online booking isn’t connected yet. Please check back soon or contact me directly." });
      return;
    }

    const form = new FormData(event.currentTarget);
    const startTime = String(form.get("start_time") ?? "");
    const endTime = String(form.get("end_time") ?? "");
    if (startTime >= endTime) {
      setResult({ ok: false, message: "Please choose an end time after your start time." });
      return;
    }
    const hours = (new Date(`1970-01-01T${endTime}`).getTime() - new Date(`1970-01-01T${startTime}`).getTime()) / 3_600_000;

    setSubmitting(true);
    const { error } = await supabase.functions.invoke("submit-request", {
      body: {
        parent_name: form.get("parent_name"),
        parent_email: form.get("parent_email"),
        parent_phone: form.get("parent_phone"),
        requested_date: form.get("requested_date"),
        start_time: startTime,
        end_time: endTime,
        children_count: Number(form.get("children_count")),
        location: form.get("location"),
        instructions: form.get("instructions"),
        estimated_total: oneChildEstimate ? Math.round(hours * 22 * 100) / 100 : null,
      },
    });
    setSubmitting(false);
    if (error) {
      setResult({ ok: false, message: error.message || "Something went wrong. Please try again or reach out directly." });
      return;
    }
    setResult({ ok: true, message: "Your request is in! It’s pending approval, and I’ll be in touch after I confirm the details." });
    event.currentTarget.reset();
    setChildrenCount("1");
  }

  return (
    <main className="inner-page booking-page">
      <section className="page-intro">
        <span className="eyebrow"><span className="eyebrow-dot" /> Start with a hello</span>
        <h1>Let’s find a time<br />that <em>works for you.</em></h1>
        <p>Share a few details about your requested sitting. I’ll personally confirm availability and pricing—requests aren’t confirmed until we’ve connected.</p>
      </section>
      <div className="booking-layout section-wrap">
        <form className="booking-form" onSubmit={submitRequest}>
          <div className="form-section-heading"><span>01</span><div><h2>When & where</h2><p>Tell me what you have in mind.</p></div></div>
          <div className="form-grid">
            <label className="form-field"><span>Preferred date <b>*</b></span><input type="date" name="requested_date" min={todayPhoenix} required /></label>
            <label className="form-field"><span>Neighborhood or general location <b>*</b></span><input type="text" name="location" autoComplete="address-level2" placeholder="e.g. Arcadia, Phoenix" required maxLength={120} /></label>
            <label className="form-field"><span>Start time <b>*</b></span><input type="time" name="start_time" required /></label>
            <label className="form-field"><span>End time <b>*</b></span><input type="time" name="end_time" required /></label>
            <label className="form-field form-full"><span>Number of children <b>*</b></span><select name="children_count" value={childrenCount} onChange={(event) => setChildrenCount(event.target.value)}><option value="1">1 child</option><option value="2">2 children</option><option value="3">3 children</option><option value="4">4 children</option></select></label>
          </div>
          <div className="form-section-heading form-heading-spaced"><span>02</span><div><h2>A little about you</h2><p>So I know who to get back to.</p></div></div>
          <div className="form-grid">
            <label className="form-field"><span>Your name <b>*</b></span><input type="text" name="parent_name" autoComplete="name" required maxLength={100} /></label>
            <label className="form-field"><span>Email address <b>*</b></span><input type="email" name="parent_email" autoComplete="email" required maxLength={254} /></label>
            <label className="form-field form-full"><span>Phone number <b>*</b></span><input type="tel" name="parent_phone" autoComplete="tel" required maxLength={30} /></label>
            <label className="form-field form-full"><span>Anything else I should know? <small>(optional)</small></span><textarea name="instructions" rows={4} maxLength={1500} placeholder="A brief note about your plans or what would make this sitting a great fit." /></label>
          </div>
          <div className="form-estimate"><span><Clock3 size={16} /> Estimated starting price</span><strong>{oneChildEstimate ? "$22 / hour" : "Personalized quote"}</strong><small>{oneChildEstimate ? "One child; the total depends on hours." : "I’ll confirm additional-child pricing with you."}</small></div>
          {result && <div className={`form-message ${result.ok ? "success" : "error"}`} role="status">{result.ok ? <Check size={17} /> : <ShieldCheck size={17} />}{result.message}</div>}
          {!isSupabaseConfigured && <div className="setup-notice"><LockKeyhole size={16} /><span>Booking requests are not connected yet. This form will submit securely after the owner connects the database.</span></div>}
          <button type="submit" className="button button-dark button-full" disabled={submitting}>{submitting ? "Sending request…" : "Send booking request"}{!submitting && <ArrowRight size={15} />}</button>
          <p className="form-privacy"><LockKeyhole size={13} /> Your contact details are private and used only to respond to your request.</p>
        </form>
        <aside className="booking-aside">
          <div className="aside-card"><span className="aside-icon"><CalendarDays size={20} /></span><h3>What happens next?</h3><p>Your request is marked <strong>Pending Approval</strong>. I’ll check availability, follow up personally, and confirm the details together.</p><div className="aside-line" /><p className="aside-small">Please wait for my confirmation before making plans around a sitting.</p></div>
          <div className="aside-privacy"><ShieldCheck size={19} /><div><strong>Thoughtful with your details</strong><p>Please share only what’s needed to start a conversation. A secure child-care questionnaire can be completed after we connect.</p></div></div>
          <Link to="/policies" className="aside-policy">Read the booking & privacy policies <ArrowRight size={14} /></Link>
        </aside>
      </div>
    </main>
  );
}

function PoliciesPage() {
  return (
    <main className="inner-page">
      <section className="page-intro">
        <span className="eyebrow"><span className="eyebrow-dot" /> Clear, kind, and fair</span>
        <h1>A few things to<br />know <em>before we begin.</em></h1>
        <p>I want every family to feel comfortable and informed. Here’s how requests, changes, and your information are handled.</p>
      </section>
      <section className="policy-list section-wrap">
        <article><span>01</span><div><h2>Booking requests</h2><p>Submitting a request does not confirm a sitting. Each request is pending until I review the schedule, confirm pricing, and personally approve the booking. Please wait for written confirmation before relying on a requested date.</p></div></article>
        <article><span>02</span><div><h2>Rates & payment</h2><p>The starting rate is $22 per hour for one child. Rates for additional children are discussed and confirmed with you before a booking is accepted. Final availability and pricing are subject to confirmation.</p></div></article>
        <article><span>03</span><div><h2>Changes & cancellations</h2><p>Please contact me as soon as possible if your plans change. We’ll discuss rescheduling or cancellation directly. Specific notice periods and any applicable fees should be agreed before your sitting is confirmed.</p></div></article>
        <article><span>04</span><div><h2>Your privacy</h2><p>Contact details are used to respond to booking inquiries and coordinate care. Information about children is private and should only be submitted through a secure, authenticated form when available. It is not published or included in calendar descriptions or text messages.</p></div></article>
        <article><span>05</span><div><h2>Data & security</h2><p>This website’s booking database and private dashboard are still being connected. Until secure storage and authentication are enabled, please do not submit sensitive child, health, or emergency-contact information here.</p></div></article>
      </section>
    </main>
  );
}

type BookingRecord = {
  id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  requested_date: string;
  start_time: string;
  end_time: string;
  children_count: number;
  status: string;
  estimated_total: number | null;
};

function AdminPage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [rows, setRows] = useState<BookingRecord[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setSessionEmail(data.session?.user.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSessionEmail(session?.user.email ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !sessionEmail) return;
    let active = true;
    void supabase.from("bookings").select("id,parent_name,parent_email,parent_phone,requested_date,start_time,end_time,children_count,status,estimated_total").order("requested_date", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setMessage("Couldn’t load requests. Check that the admin account and database policies are configured.");
        else setRows((data ?? []) as BookingRecord[]);
      });
    return () => { active = false; };
  }, [sessionEmail]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMessage("Sign-in failed. Check your credentials and that your account has admin access.");
    else setMessage("");
  }

  async function updateBooking(id: string, action: "approve" | "decline") {
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.functions.invoke("manage-booking", { body: { booking_id: id, action } });
    setBusy(false);
    if (error) { setMessage("The booking could not be updated. Check the server response and integration setup."); return; }
    setRows((current) => current.map((booking) => booking.id === id ? { ...booking, status: action === "approve" ? "confirmed" : "declined" } : booking));
  }

  return (
    <main className="inner-page admin-page">
      <section className="page-intro admin-intro"><span className="eyebrow"><LockKeyhole size={13} /> Private area</span><h1>Your care<br /><em>dashboard.</em></h1><p>Private booking management. Only an authenticated admin account can view requests.</p></section>
      {!isSupabaseConfigured ? <div className="admin-config-card"><LockKeyhole size={22} /><h2>Private dashboard not connected</h2><p>Connect Supabase and configure admin access before this dashboard can display booking requests.</p></div>
        : !sessionEmail ? <form className="admin-login" onSubmit={signIn}><h2>Welcome back</h2><p>Sign in with your private admin account.</p><label className="form-field"><span>Email address</span><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="form-field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{message && <p className="admin-message" role="status">{message}</p>}<button className="button button-dark button-full" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"} <ArrowRight size={15} /></button></form>
        : <section className="admin-bookings"><div className="admin-bookings-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> Signed in as {sessionEmail}</span><h2>Booking requests</h2></div><button className="text-link logout-button" onClick={() => void supabase?.auth.signOut()}>Sign out <ArrowRight size={14} /></button></div>{message && <p className="admin-message" role="status">{message}</p>}{rows.length === 0 ? <div className="empty-state"><CalendarDays size={24} /><h3>No requests yet</h3><p>New booking requests will appear here once they’re connected to the database.</p></div> : <div className="booking-table">{rows.map((booking) => <article className="admin-booking-row" key={booking.id}><div className="admin-booking-date">{booking.requested_date}<small>{booking.start_time}–{booking.end_time}</small></div><div className="admin-booking-info"><strong>{booking.parent_name} · {booking.children_count} {booking.children_count === 1 ? "child" : "children"}</strong><small>{booking.parent_email} · {booking.parent_phone}</small></div><span className={`status-chip ${booking.status}`}>{booking.status.replace("_", " ")}</span>{booking.status === "pending_approval" && <div className="booking-actions"><button disabled={busy} onClick={() => void updateBooking(booking.id, "approve")}>Approve</button><button disabled={busy} onClick={() => void updateBooking(booking.id, "decline")}>Decline</button></div>}</article>)}</div>}</section>}
    </main>
  );
}

function App() {
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [location.pathname]);

  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
