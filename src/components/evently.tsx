"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Flower2,
  LayoutDashboard,
  CalendarDays,
  Users,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  ChevronRight,
  Menu,
  Bell,
  HelpCircle,
  Leaf,
  Heart,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { api, Field, Modal, Art, Stat, fmtDate, type Data } from "./shared";
function Brand() {
  return (
    <Link href="/" className="brand">
      <Flower2 size={29} strokeWidth={1.3} />
      evently<span style={{ color: "#b99558", marginLeft: -7 }}>.</span>
    </Link>
  );
}
function Shell({
  children,
  user,
  path,
}: {
  children: React.ReactNode;
  user: Data;
  path: string[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const nav = [
    ["Overview", LayoutDashboard, "/dashboard"],
    ["My events", CalendarDays, "/dashboard?view=events"],
    ["Guest directory", Users, "/dashboard?view=guests"],
    ["Insights", ChartNoAxesCombined, "/dashboard?view=insights"],
  ] as const;
  return (
    <div className="app">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Brand />
        <div className="workspace-label">YOUR WORKSPACE</div>
        {nav.map(([label, Icon, href], i) => (
          <a
            onClick={() => setOpen(false)}
            className={`side-link ${i === 0 && path.length === 1 ? "active" : i === 1 && path.length > 1 ? "active" : ""}`}
            href={href}
            key={label}
          >
            <Icon strokeWidth={1.5} />
            {label}
          </a>
        ))}
        <Link className="side-link" href="/dashboard/settings">
          <Settings strokeWidth={1.5} />
          Settings
        </Link>
        <div className="sidebar-bottom">
          <div className="help-card">
            <Leaf size={20} strokeWidth={1.4} />
            <h3 style={{ fontSize: 12, marginTop: 10 }}>
              A little less waste.
              <br />A lot more celebration.
            </h3>
            <p>Plan thoughtfully. Make every gathering count.</p>
            <Link
              href="/dashboard?view=insights"
              style={{ fontSize: 10, color: "#6e855e" }}
            >
              Explore your insights{" "}
              <ArrowRight size={11} style={{ display: "inline" }} />
            </Link>
          </div>
          <button
            className="side-link"
            style={{ border: 0, background: "none" }}
            onClick={async () => {
              await api("auth/logout", "POST");
              router.push("/login");
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
          <div className="profile">
            <div className="avatar">
              {user.name
                .split(" ")
                .slice(0, 2)
                .map((s: string) => s[0])
                .join("")}
            </div>
            <div>
              {user.name}
              <small>Family organiser</small>
            </div>
            <ChevronRight size={13} style={{ marginLeft: "auto" }} />
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            Your workspace{" "}
            <span style={{ padding: "0 10px", color: "#c5cabc" }}>/</span>
            <span style={{ color: "#4e6455" }}>
              {path[1] === "events"
                ? "My events"
                : path[1] === "settings"
                  ? "Settings"
                  : "Overview"}
            </span>
          </div>
          <div className="top-actions">
            <span
              className="top-date"
              style={{ fontSize: 11, color: "#8b9585" }}
            >
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <Link href="/#faq" aria-label="Help">
              <HelpCircle strokeWidth={1.4} />
            </Link>
            <Link href="/dashboard?view=activity" aria-label="Recent activity">
              <Bell strokeWidth={1.4} />
            </Link>
            <div
              className="avatar"
              style={{ width: 29, height: 29, fontSize: 10 }}
            >
              {user.name[0]}
            </div>
          </div>
        </header>
        <main className="content">
          {children}
          <footer className="app-footer">
            <span>
              © {new Date().getFullYear()} Evently. Made for meaningful
              gatherings.
            </span>
            <div>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/#faq">Help & support ↗</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
function EventCard({ event: e }: { event: Data }) {
  const a = e.analytics;
  return (
    <Link className="event-card" href={`/dashboard/events/${e.id}`}>
      <Art event={e} />
      <div className="event-card-body">
        <div className="event-title">
          <h3>{e.title}</h3>
          <span className={`badge ${e.status === "DRAFT" ? "draft" : ""}`}>
            {e.status === "DRAFT"
              ? "Draft"
              : new Date(e.startsAt) < new Date()
                ? "Completed"
                : "Upcoming"}
          </span>
        </div>
        <div className="event-meta">
          <span>
            <CalendarDays />
            {fmtDate(e.startsAt, e.timezone)}
          </span>
          <span>
            <MapPin />
            {e.venue || "Venue to be decided"}
          </span>
        </div>
        <div className="event-counts">
          <div>
            <strong>{a.invited}</strong>
            <small>Invited people</small>
          </div>
          <div>
            <strong style={{ color: "#6c8e5d" }}>{a.confirmed}</strong>
            <small>Confirmed</small>
          </div>
          <div>
            <strong style={{ color: "#bc9b59" }}>{a.pending}</strong>
            <small>Awaiting reply</small>
          </div>
        </div>
        <div className="event-bottom">
          <span style={{ color: "#91a085" }}>{a.completion}% responded</span>
          <div className="progress">
            <div style={{ width: `${a.completion}%` }} />
          </div>
          <span style={{ color: "#58714f" }}>
            Manage event{" "}
            <ArrowUpRight
              size={12}
              style={{ display: "inline", verticalAlign: "middle" }}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
function Activity({ events }: { events: Data[] }) {
  const entries = events
    .flatMap((e) =>
      e.invitations
        .filter((i: Data) => i.rsvp)
        .map((i: Data) => ({ ...i, event: e })),
    )
    .sort(
      (a, b) =>
        new Date(b.rsvp.updatedAt).getTime() -
        new Date(a.rsvp.updatedAt).getTime(),
    )
    .slice(0, 5);
  return (
    <>
      {entries.length ? (
        entries.map((i) => (
          <div className="activity" key={i.id}>
            <span className="dot">
              {i.rsvp.status === "YES" ? <Check /> : <Clock />}
            </span>
            <div>
              <p>
                <strong style={{ fontWeight: 500 }}>{i.name}</strong>{" "}
                {i.rsvp.status === "YES"
                  ? `confirmed ${i.rsvp.partySize} ${i.rsvp.partySize === 1 ? "person" : "people"}`
                  : i.rsvp.status === "NO"
                    ? "declined the invitation"
                    : "responded maybe"}
                <br />
                <span className="muted">{i.event.title}</span>
              </p>
              <small>{fmtDate(i.rsvp.updatedAt, i.event.timezone)}</small>
            </div>
          </div>
        ))
      ) : (
        <p className="muted" style={{ fontSize: 12 }}>
          Your guests’ replies will appear here.
        </p>
      )}
    </>
  );
}
function Dashboard({ user }: { user: Data }) {
  const [events, setEvents] = useState<Data[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Upcoming");
  const [view, setView] = useState("");
  const load = useCallback(
    () =>
      api("events")
        .then(setEvents)
        .catch((e) => setError(e.message)),
    [],
  );
  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    setView(new URLSearchParams(location.search).get("view") || "");
    return () => clearInterval(id);
  }, [load]);
  const totals = (key: string) =>
    events?.reduce((sum, e) => sum + e.analytics[key], 0) || 0;
  const upcoming =
    events?.filter(
      (e) => e.status === "PUBLISHED" && new Date(e.startsAt) >= new Date(),
    ) || [];
  const displayed = events?.filter(
    (e) =>
      filter === "All events" ||
      (filter === "Drafts" && e.status === "DRAFT") ||
      (filter === "Upcoming" &&
        e.status === "PUBLISHED" &&
        new Date(e.startsAt) >= new Date()) ||
      (filter === "Past events" && new Date(e.startsAt) < new Date()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            {view === "guests"
              ? "Your guest directory"
              : view === "insights"
                ? "Every gathering, in perspective"
                : view === "events"
                  ? "Your celebrations"
                  : `Welcome back, ${user.name.split(" ")[0]}`}{" "}
            <span className="welcome-spark">✧</span>
          </h1>
          <p>A little planning today. A beautiful celebration tomorrow.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">
            <Plus size={16} />
            Create an event
          </Link>
        </Button>
      </div>
      {error && (
        <div role="alert" className="error-box">
          {error}
          <Button variant="ghost" onClick={load}>
            Try again
          </Button>
        </div>
      )}
      {!events ? (
        <>
          <div className="loading" />
          <div className="loading" />
        </>
      ) : (
        <>
          <div className="stats">
            <Stat
              label="Total events"
              value={events.length}
              sub={`${upcoming.length} upcoming celebrations`}
              icon={CalendarDays}
            />
            <Stat
              label="Invited people"
              value={totals("invited")}
              sub="Across tracked invitations"
              icon={Users}
            />
            <Stat
              label="Confirmed attendees"
              value={totals("confirmed")}
              sub="People ready to celebrate"
              icon={CheckCircle2}
            />
            <Stat
              label="Awaiting response"
              value={totals("pending")}
              sub={`${totals("declined")} people declined · ${totals("maybe")} maybe`}
              icon={Clock}
            />
          </div>
          {view === "guests" ? (
            <div className="panel">
              <h2>Guests across your events</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Guest / family</th>
                      <th>Event</th>
                      <th>Invited</th>
                      <th>Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.flatMap((e) =>
                      e.invitations.map((g: Data) => (
                        <tr key={g.id}>
                          <td>{g.name}</td>
                          <td>
                            <Link href={`/dashboard/events/${e.id}?tab=Guests`}>
                              {e.title} ↗
                            </Link>
                          </td>
                          <td>{g.invitedSize}</td>
                          <td>{g.rsvp?.status || "Pending"}</td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : view === "insights" ? (
            <div className="panel">
              <h2>Attendance across events</h2>
              <div className="chart">
                <ResponsiveContainer>
                  <BarChart
                    data={events.map((e) => ({
                      name: e.title,
                      confirmed: e.analytics.confirmed,
                      expected: e.analytics.expected,
                    }))}
                  >
                    <CartesianGrid vertical={false} stroke="#edf0e7" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar
                      dataKey="confirmed"
                      fill="#527a58"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expected"
                      fill="#d2ba86"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="notice">
                Expected attendance is a provisional estimate using each event’s
                editable assumptions. Public invitation populations are unknown.
              </p>
            </div>
          ) : (
            <div className="dashboard-grid">
              <div>
                <section className="panel">
                  <div className="panel-heading">
                    <h3>
                      Your events{" "}
                      <span
                        style={{
                          color: "#9aa48d",
                          fontSize: 11,
                          fontWeight: 400,
                          marginLeft: 8,
                        }}
                      >
                        {events.length} celebrations
                      </span>
                    </h3>
                    <Link href="/dashboard/events/new">
                      View all{" "}
                      <ArrowUpRight size={12} style={{ display: "inline" }} />
                    </Link>
                  </div>
                  <div className="section-tabs">
                    {["Upcoming", "All events", "Drafts", "Past events"].map(
                      (f) => (
                        <button
                          className={filter === f ? "selected" : ""}
                          onClick={() => setFilter(f)}
                          key={f}
                        >
                          {f}
                          {f === "Upcoming" ? ` (${upcoming.length})` : ""}
                        </button>
                      ),
                    )}
                  </div>
                  {displayed?.length ? (
                    displayed.map((e) => <EventCard event={e} key={e.id} />)
                  ) : (
                    <div className="empty">
                      <CalendarDays size={39} strokeWidth={1} />
                      <h2>
                        {events.length
                          ? "A little room for your next celebration."
                          : "Something wonderful starts here."}
                      </h2>
                      <p>
                        Create your first invitation, bring your people
                        together, and let us help with the details.
                      </p>
                      <Button asChild>
                        <Link href="/dashboard/events/new">
                          <Plus size={15} />
                          Create an event
                        </Link>
                      </Button>
                    </div>
                  )}
                  <Link
                    href="/dashboard/events/new"
                    style={{
                      border: "1px dashed #d8dfce",
                      borderRadius: 7,
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: 11,
                      color: "#8b9b7d",
                    }}
                  >
                    <Plus size={14} />A new occasion to bring people together
                  </Link>
                </section>
              </div>
              <aside className="dashboard-right">
                <section className="panel">
                  <div className="panel-heading">
                    <h3>Recent activity</h3>
                    <span
                      style={{
                        height: 6,
                        width: 6,
                        background: "#87a46c",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                  <Activity events={events} />
                  <p
                    style={{
                      borderTop: "1px solid #edf0e7",
                      paddingTop: 14,
                      marginBottom: 0,
                      fontSize: 10,
                      color: "#9aa48d",
                    }}
                  >
                    Updates automatically every 15 seconds
                  </p>
                </section>
                <section className="tip">
                  <span className="eyebrow" style={{ fontSize: 9 }}>
                    <Leaf
                      size={14}
                      style={{
                        display: "inline",
                        verticalAlign: "middle",
                        marginRight: 7,
                      }}
                    />
                    THOUGHTFUL CELEBRATIONS
                  </span>
                  <h3>
                    More joy.
                    <br />
                    Less food waste.
                  </h3>
                  <p>
                    A clearer guest count helps you plan the right amount of
                    food, without the guesswork.
                  </p>
                  <Button variant="outline" asChild>
                    <Link
                      href={
                        events[0]
                          ? `/dashboard/events/${events[0].id}/catering`
                          : "/dashboard/events/new"
                      }
                    >
                      Explore catering planner <ArrowRight size={13} />
                    </Link>
                  </Button>
                </section>
              </aside>
            </div>
          )}
          <div className="bottom-banner">
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <Heart size={30} strokeWidth={1} color="#b59b63" />
              <div>
                <h3>Good company starts with a thoughtful invitation.</h3>
                <p>
                  One beautiful link. Every guest accounted for. More time for
                  what matters.
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/events/new">
                Create your next celebration <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </>
      )}
    </>
  );
}
const authSchema = z.object({
  name: z.string().optional(),
  email: z.email("Enter a valid email"),
  password: z.string().min(12, "Use at least 12 characters").max(72),
});
function Auth({ mode }: { mode: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const form = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const register = mode === "register",
    forgot = mode === "forgot-password",
    reset = mode === "reset-password";
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    try {
      if (!forgot && !reset) {
        const parsed = authSchema.safeParse(data);
        if (!parsed.success) throw Error(parsed.error.issues[0].message);
        if (register && String(data.name).trim().length < 2)
          throw Error("Enter your full name");
      }
      if (reset)
        data.token = new URLSearchParams(location.search).get("token") || "";
      const result = await api(`auth/${mode}`, "POST", data);
      if (forgot || reset) setDone(result.message);
      else {
        toast.success(register ? "Your account is ready" : "Welcome back");
        router.push("/dashboard");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth">
      <div className="auth-story">
        <Brand />
        <div>
          <span className="eyebrow">FOR YOUR PEOPLE. FOR YOUR MOMENTS.</span>
          <h1>
            Less planning.
            <br />
            More being
            <br />
            together.
          </h1>
          <p>
            Beautiful invitations, thoughtful guest lists, and a little more
            peace of mind.
          </p>
        </div>
        <small>One invitation link. Every guest accounted for.</small>
      </div>
      <div className="auth-form">
        <div className="auth-form-inner">
          <div style={{ marginBottom: 45 }}>
            <Brand />
          </div>
          <h1>
            {register
              ? "Begin something beautiful."
              : forgot
                ? "Let’s get you back in."
                : reset
                  ? "A fresh start."
                  : "Welcome back."}
          </h1>
          <p className="muted" style={{ fontSize: 13, marginBottom: 30 }}>
            {register
              ? "Create your account. Your next celebration awaits."
              : forgot
                ? "We’ll send a secure password reset link."
                : reset
                  ? "Choose a new password with at least 12 characters."
                  : "Your people. Your celebrations. All in one place."}
          </p>
          {error && (
            <div className="error-box" role="alert">
              {error}
            </div>
          )}
          {done ? (
            <div className="success">
              {done}
              <p>
                <Link href="/login">Back to sign in →</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              {register && (
                <Field label="Your name">
                  <input
                    {...form.register("name")}
                    required
                    autoComplete="name"
                    placeholder="Ananya Sharma"
                  />
                </Field>
              )}
              {!reset && (
                <Field label="Email address">
                  <input
                    {...form.register("email")}
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </Field>
              )}
              {!forgot && (
                <Field
                  label="Password"
                  hint={
                    register
                      ? "At least 12 characters. Make it uniquely yours."
                      : undefined
                  }
                >
                  <input
                    {...form.register("password")}
                    required
                    type="password"
                    minLength={12}
                    maxLength={72}
                    autoComplete={
                      register || reset ? "new-password" : "current-password"
                    }
                    placeholder="Enter your password"
                  />
                </Field>
              )}
              {!register && !forgot && !reset && (
                <div
                  style={{
                    textAlign: "right",
                    fontSize: 11,
                    marginTop: -5,
                    marginBottom: 16,
                  }}
                >
                  <Link href="/forgot-password">Forgot password?</Link>
                </div>
              )}
              <Button disabled={busy}>
                {busy
                  ? "Please wait…"
                  : register
                    ? "Create your account"
                    : forgot
                      ? "Send reset link"
                      : reset
                        ? "Update password"
                        : "Sign in"}
                <ArrowRight size={15} />
              </Button>
            </form>
          )}
          <p className="legal">
            {register ? (
              <>
                Already have an account? <Link href="/login">Sign in</Link>
              </>
            ) : !forgot && !reset ? (
              <>
                New to Evently? <Link href="/register">Create an account</Link>
              </>
            ) : null}
          </p>
          <p className="legal">
            By continuing, you agree to our <Link href="/terms">Terms</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
function Marketing() {
  return (
    <div className="marketing">
      <nav>
        <Brand />
        <div className="links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link href="/login">Sign in</Link>
          <Button asChild>
            <Link href="/register">
              Get started <ArrowUpRight size={14} />
            </Link>
          </Button>
        </div>
      </nav>
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">
            BIG MOMENTS. LITTLE DETAILS. ALL TOGETHER.
          </span>
          <h1>
            Celebrate more.
            <br />
            <em style={{ color: "#68815b" }}>Worry less.</em>
          </h1>
          <p>
            Beautiful invitations. Effortless RSVPs. A clearer guest count.
            Bring your people together, and leave the guesswork behind.
          </p>
          <div className="hero-actions">
            <Button asChild>
              <Link href="/register">
                Create Your Event <ArrowRight size={15} />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>
          <p style={{ fontSize: 11, marginTop: 24 }}>
            <Check size={12} style={{ display: "inline", marginRight: 5 }} />
            No app for your guests. Just one beautiful link.
          </p>
        </motion.div>
        <div className="hero-visual">
          <div className="invitation-mini">
            <Flower2
              size={35}
              strokeWidth={1}
              style={{ margin: "auto", color: "#899b70" }}
            />
            <p>TOGETHER WITH OUR FAMILIES</p>
            <h2>
              Ananya
              <br />& Aarav
            </h2>
            <p>INVITE YOU TO CELEBRATE THEIR WEDDING</p>
            <div
              style={{
                borderTop: "1px solid #d9ddcb",
                borderBottom: "1px solid #d9ddcb",
                padding: 15,
                fontFamily: "Georgia",
                fontSize: 17,
              }}
            >
              14 · FEBRUARY · 2027
            </div>
            <p>THE LEELA PALACE · BENGALURU</p>
          </div>
          <div className="mini-stat">
            <CheckCircle2 size={27} strokeWidth={1.3} />
            <div>
              <strong>You’re on the list.</strong>
              <span>One reply. A little more peace of mind.</span>
            </div>
          </div>
        </div>
      </section>
      <section className="marketing-section center" id="how-it-works">
        <span className="eyebrow">FROM INVITATION TO CELEBRATION</span>
        <h2 style={{ marginTop: 15 }}>
          Three little steps. One lovely gathering.
        </h2>
        <p>Spend less time following up, and more time looking forward.</p>
        <div className="feature-grid">
          {[
            [
              "01",
              "Make it yours",
              "Create an event and choose a beautiful invitation that feels like you.",
            ],
            [
              "02",
              "Share the joy",
              "Send one link on WhatsApp. Your guests reply without an account or an app.",
            ],
            [
              "03",
              "Plan with clarity",
              "See every response, count every person, and plan your food thoughtfully.",
            ],
          ].map(([n, t, p]) => (
            <div className="feature" key={n}>
              <div className="step-num">{n}</div>
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="marketing-section center" id="features">
        <span className="eyebrow">EVERY DETAIL, A LITTLE EASIER</span>
        <h2 style={{ marginTop: 15 }}>Made for the way we celebrate.</h2>
        <div className="feature-grid">
          {[
            [
              Users,
              "Count people, not just replies",
              "Family and household invitations keep your real guest count clear.",
            ],
            [
              Mail,
              "An invitation worth opening",
              "Elegant, mobile-friendly designs for weddings, birthdays, and everything between.",
            ],
            [
              Leaf,
              "A thoughtful table",
              "Turn actual RSVPs into a provisional catering plan, with assumptions you control.",
            ],
          ].map(([Icon, t, p]: Data) => (
            <div className="feature" key={t}>
              <Icon size={29} strokeWidth={1.2} />
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="marketing-section center">
        <span className="eyebrow">A LITTLE PREVIEW</span>
        <h2 style={{ marginTop: 15 }}>Your whole celebration, at a glance.</h2>
        <div
          className="panel"
          style={{
            textAlign: "left",
            maxWidth: 900,
            margin: "30px auto",
            boxShadow: "0 15px 60px #1b3e2810",
          }}
        >
          <div className="panel-heading">
            <h3>Ananya & Aarav · Illustrative preview</h3>
            <span className="badge">Wedding</span>
          </div>
          <div className="stats" style={{ marginBottom: 0 }}>
            <Stat
              label="Invited people"
              value="120"
              sub="From tracked invitations"
              icon={Users}
            />
            <Stat
              label="Confirmed"
              value="84"
              sub="People, including families"
              icon={CheckCircle2}
            />
            <Stat
              label="Maybe"
              value="12"
              sub="Still making plans"
              icon={Clock}
            />
            <Stat
              label="Awaiting reply"
              value="18"
              sub="Time for a gentle reminder"
              icon={Mail}
            />
          </div>
        </div>
        <p>
          Illustrative data. Your dashboard always uses your stored event and
          guest information.
        </p>
      </section>
      <section className="marketing-section center">
        <h2>An invitation for every kind of joy.</h2>
        <div className="template-grid">
          {["Botanical", "Royal", "Minimal"].map((template, i) => (
            <div className="panel" key={template}>
              <Art
                event={{
                  title: [
                    "Ananya & Aarav",
                    "A golden milestone",
                    "A little celebration",
                  ][i],
                  type: ["Wedding", "Anniversary", "Birthday"][i],
                  startsAt: "2027-02-14",
                  timezone: "Asia/Kolkata",
                  template,
                  theme: i === 2 ? "rose" : "emerald",
                }}
              />
              <p>{template}</p>
            </div>
          ))}
        </div>
      </section>
      <section
        className="marketing-section"
        style={{ background: "#edf1e5", borderRadius: 20 }}
      >
        <div className="two-col" style={{ alignItems: "center" }}>
          <div>
            <span className="eyebrow">A FULL TABLE. A LIGHTER FOOTPRINT.</span>
            <h2 style={{ marginTop: 16 }}>Good food. Thoughtful quantities.</h2>
            <p className="muted">
              Use confirmed replies, maybe responses, and your own assumptions
              to plan each meal. Compare plate costs and add a sensible
              contingency.
            </p>
          </div>
          <div className="panel" style={{ margin: 0 }}>
            <Leaf size={30} strokeWidth={1} />
            <h3 style={{ fontFamily: "Georgia", fontSize: 25, marginTop: 20 }}>
              Clarity over guesswork.
            </h3>
            <p className="muted">
              Our estimates are transparent and provisional. You stay in control
              of every quantity and every decision.
            </p>
            <Button asChild>
              <Link href="/register">
                Start planning <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="marketing-section center" id="pricing">
        <span className="eyebrow">ROOM TO CELEBRATE</span>
        <h2 style={{ marginTop: 15 }}>Start with the essentials.</h2>
        <div className="panel" style={{ maxWidth: 450, margin: "auto" }}>
          <h3>Evently MVP</h3>
          <p style={{ fontFamily: "Georgia", fontSize: 38 }}>
            Free to get started
          </p>
          <p className="muted">
            Invitations, household RSVPs, attendance insights, and catering
            planning. No payment details required.
          </p>
          <Button asChild>
            <Link href="/register">
              Create Your Event <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
      </section>
      <section className="marketing-section center" id="faq">
        <h2>A few things you might be wondering.</h2>
        <div className="faq">
          {[
            [
              "Do guests need an account?",
              "No. They open their invitation link and respond directly. No app, account, or password needed.",
            ],
            [
              "Can a whole family reply together?",
              "Yes. A household invitation represents multiple people. Guests confirm their party size within the invitation limit.",
            ],
            [
              "Can guests change their minds?",
              "Yes, through their invitation link until the RSVP deadline or until you close responses. Public guests should use the same browser or save their private update link.",
            ],
            [
              "Does Evently predict attendance using AI?",
              "No. Estimates use editable probabilities and your guest data. Every assumption is visible, and all estimates are provisional.",
            ],
            [
              "Who can see my guest information?",
              "Only your organiser account can access your event guest list. Caterers and partners do not receive guest details by default.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="marketing-section center">
        <h2>Make room for what matters.</h2>
        <p>Your people. Your moments. A little less worry.</p>
        <Button asChild>
          <Link href="/register">
            Create Your Event <ArrowRight size={15} />
          </Link>
        </Button>
        <p style={{ fontSize: 12, marginTop: 30 }}>
          An event planner or caterer?{" "}
          <Link href="/partners" style={{ textDecoration: "underline" }}>
            Let’s build something together.
          </Link>
        </p>
      </section>
      <footer className="marketing-footer">
        <Brand />
        <span>Thoughtfully made for meaningful gatherings.</span>
        <div>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/partners">Partners</Link>
        </div>
      </footer>
    </div>
  );
}
function Partner() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div style={{ maxWidth: 650, margin: "35px auto", padding: 25 }}>
      <Brand />
      <h1 style={{ marginTop: 50 }}>Better celebrations, together.</h1>
      <p className="muted">
        An early invitation for event planners and caterers. Register your
        interest in future partner tools.
      </p>
      <div className="panel">
        {done ? (
          <div className="success">
            Thank you. Your interest has been recorded.
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const b = Object.fromEntries(new FormData(e.currentTarget));
              setBusy(true);
              try {
                await api("partners/interest", "POST", b);
                setDone(true);
              } catch (e) {
                toast.error((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="fields">
              {[
                ["businessName", "Business name"],
                ["contactName", "Contact name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["city", "City"],
              ].map(([name, label]) => (
                <Field label={label} key={name}>
                  <input
                    name={name}
                    type={name === "email" ? "email" : "text"}
                    required
                    maxLength={150}
                  />
                </Field>
              ))}
              <Field label="Business category">
                <select name="category">
                  <option>Caterer</option>
                  <option>Event planner</option>
                  <option>Other</option>
                </select>
              </Field>
            </div>
            <Field label="Tell us a little about your business">
              <textarea name="message" maxLength={2000} />
            </Field>
            <p className="notice">
              This records interest only. No partner account or guest
              information access is granted.
            </p>
            <Button disabled={busy}>
              Register interest <ArrowRight size={14} />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
function Legal({ privacy }: { privacy: boolean }) {
  return (
    <div style={{ maxWidth: 760, padding: 30, margin: "30px auto" }}>
      <Brand />
      <h1 style={{ marginTop: 50 }}>
        {privacy
          ? "Your moments are personal. Your data should be too."
          : "Terms of use"}
      </h1>
      <p className="muted">Effective 30 October 2026 · Evently MVP</p>
      {privacy ? (
        <>
          <h2>What we collect</h2>
          <p>
            We store organiser names, email addresses and password hashes.
            Organisers may provide guest names, contact details and household
            sizes. Guest responses include attendance, party size, meal
            preference and an optional message. Avoid entering sensitive
            information in messages.
          </p>
          <h2>Why we collect it</h2>
          <p>
            We use this information to operate invitations, guest responses,
            attendance summaries and catering plans. Guest information is
            visible to the event organiser. We do not provide personal guest
            information to caterers or partners by default.
          </p>
          <h2>Your choices</h2>
          <p>
            Guests can update their response until the event deadline and ask
            the host to remove their details. Organisers can delete guests,
            events or their account in settings. Account deletion removes owned
            events and guest records. Access tokens should be treated as private
            links.
          </p>
          <h2>Storage and security</h2>
          <p>
            Sessions expire after 30 days. Password reset tokens expire after
            one hour. Event data remains until deleted by the organiser. Hosting
            providers process data to operate the service. Production operators
            must configure their contact address, retention policy and
            applicable privacy processes before accepting real guest data.
          </p>
        </>
      ) : (
        <>
          <h2>Using Evently</h2>
          <p>
            Use the service only for events you are authorised to manage. Obtain
            an appropriate basis for collecting guest information and sharing
            invitations. Keep your account and private invitation links secure.
          </p>
          <h2>Planning estimates</h2>
          <p>
            Attendance estimates and catering costs are provisional calculations
            using your inputs. They are not attendance guarantees, statistically
            calibrated forecasts, or guaranteed savings.
          </p>
          <h2>Availability and deletion</h2>
          <p>
            This MVP is provided as-is. You can export RSVP data and delete
            events or your account. Do not use it as your only copy of critical
            event information. Payments and external messaging services are not
            included.
          </p>
        </>
      )}
      <Button variant="outline" asChild>
        <Link href="/">Back to Evently</Link>
      </Button>
    </div>
  );
}
function AccountSettings() {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <>
      <h1>Account settings</h1>
      <div className="panel">
        <h2>Your privacy, your choice.</h2>
        <p>
          Deleting your account permanently removes all your events, guest
          details, invitations, responses, and catering plans. Export anything
          you need first.
        </p>
        <Button variant="destructive" onClick={() => setConfirm(true)}>
          Delete account
        </Button>
      </div>
      {confirm && (
        <Modal title="Delete your account?" close={() => setConfirm(false)}>
          <p>This action is permanent. Enter your password to continue.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const b = Object.fromEntries(new FormData(e.currentTarget));
              setBusy(true);
              try {
                await api("auth/account", "DELETE", b);
                router.push("/");
              } catch (e) {
                toast.error((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Password">
              <input name="password" type="password" required />
            </Field>
            <Button variant="destructive" disabled={busy}>
              Permanently delete account
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
import { EventWizard } from "./wizard";
import { EventDetail } from "./event-detail";
import { Invitation } from "./invitation";
export default function Evently({ path }: { path: string[] }) {
  const [user, setUser] = useState<Data>(null);
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (path[0] === "dashboard")
      api("auth/me")
        .then(setUser)
        .catch(() => router.replace("/login"))
        .finally(() => setChecked(true));
  }, [path, router]);
  if (!path.length) return <Marketing />;
  if (
    ["login", "register", "forgot-password", "reset-password"].includes(path[0])
  )
    return <Auth mode={path[0]} />;
  if (path[0] === "invite") return <Invitation token={path[1]} />;
  if (path[0] === "partners") return <Partner />;
  if (["privacy", "terms"].includes(path[0]))
    return <Legal privacy={path[0] === "privacy"} />;
  if (path[0] === "dashboard") {
    if (!checked || !user)
      return (
        <div style={{ padding: 50 }}>
          <Brand />
          <div className="loading" style={{ marginTop: 40 }} />
        </div>
      );
    return (
      <Shell user={user} path={path}>
        {path[1] === "settings" ? (
          <AccountSettings />
        ) : path[1] === "events" && path[2] === "new" ? (
          <EventWizard />
        ) : path[1] === "events" && path[3] === "edit" ? (
          <EventWizard id={path[2]} />
        ) : path[1] === "events" && path[2] ? (
          <EventDetail
            id={path[2]}
            initialTab={path[3] === "catering" ? "Catering" : undefined}
          />
        ) : (
          <Dashboard user={user} />
        )}
      </Shell>
    );
  }
  return (
    <div className="empty">
      <h1>We couldn’t find that page.</h1>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
