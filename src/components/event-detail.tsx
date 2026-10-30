"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Copy,
  Users,
  Clock,
  CheckCircle2,
  Leaf,
  Download,
  Upload,
  Trash2,
  Pencil,
  Send,
  ExternalLink,
  Utensils,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  api,
  Field,
  Modal,
  Stat,
  Art,
  fmtDate,
  money,
  download,
  type Data,
} from "./shared";
import { Button } from "./ui/button";
export function EventDetail({
  id,
  initialTab,
}: {
  id: string;
  initialTab?: string;
}) {
  const [e, setEvent] = useState<Data>(null);
  const [tab, setTab] = useState(initialTab || "Overview");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [guest, setGuest] = useState<Data>(null);
  const [remove, setRemove] = useState<Data>(null);
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");
  const [importErrors, setImportErrors] = useState("");
  const [plan, setPlan] = useState<Data>(null);
  const [session, setSession] = useState<Data>(null);
  const router = useRouter();
  const load = useCallback(
    () =>
      api(`events/${id}`)
        .then(setEvent)
        .catch((err) => setError(err.message)),
    [id],
  );
  useEffect(() => {
    load();
    setOrigin(location.origin);
    if (!initialTab)
      setTab(new URLSearchParams(location.search).get("tab") || "Overview");
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load, initialTab]);
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Link copied");
    } catch {
      toast.error("Copy is unavailable. Select and copy the link manually.");
    }
  };
  if (!e)
    return error ? (
      <div className="error-box">{error}</div>
    ) : (
      <div className="loading" />
    );
  const a = e.analytics;
  const url = `${origin}/invite/${e.publicToken}`;
  const inviteLink = (g: Data) => `${origin}/invite/${g.token}`;
  const guests = e.invitations.filter(
    (g: Data) =>
      `${g.name} ${g.email || ""} ${g.household?.name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "ALL" || (g.rsvp?.status || "PENDING") === filter),
  );
  const activities = e.invitations
    .filter((g: Data) => g.rsvp)
    .sort(
      (x: Data, y: Data) =>
        new Date(y.rsvp.updatedAt).getTime() -
        new Date(x.rsvp.updatedAt).getTime(),
    )
    .slice(0, 6);
  const exportGuests = () =>
    download("evently-rsvps.csv", [
      [
        "Name",
        "Email",
        "Phone",
        "Household",
        "Invited people",
        "Response",
        "Confirmed party size",
        "Meal",
        "Last response",
      ],
      ...e.invitations.map((g: Data) => [
        g.name,
        g.email,
        g.phone,
        g.household?.name,
        g.invitedSize,
        g.rsvp?.status || "PENDING",
        g.rsvp?.partySize || 0,
        g.rsvp?.meal,
        g.rsvp?.updatedAt,
      ]),
    ]);
  async function saveSettings(patch: Data) {
    setBusy(true);
    try {
      await api(`events/${id}`, "PATCH", {
        ...e,
        settings: { ...e.settings, ...patch },
      });
      toast.success("Settings saved");
      await load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {e.type} · {e.status === "DRAFT" ? "DRAFT" : "YOUR CELEBRATION"}
          </span>
          <h1 style={{ marginTop: 8 }}>{e.title}</h1>
          <p>
            {fmtDate(e.startsAt, e.timezone)} ·{" "}
            {e.venue || "Venue to be decided"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/events/${id}/edit`}>
              <Pencil size={14} />
              Edit event
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/invite/${e.publicToken}`}>
              <ExternalLink size={14} />
              View invitation
            </Link>
          </Button>
        </div>
      </div>
      {error && <div className="error-box">{error}</div>}
      <div className="section-tabs">
        {[
          "Overview",
          "Guests",
          "Invitations",
          "Analytics",
          "Catering",
          "Settings",
        ].map((t) => (
          <button
            className={t === tab ? "selected" : ""}
            key={t}
            onClick={() => {
              setTab(t);
              history.replaceState(
                null,
                "",
                `/dashboard/events/${id}${t === "Catering" ? "/catering" : `?tab=${t}`}`,
              );
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <>
          <div className="stats">
            <Stat
              label="Confirmed people"
              value={a.confirmed}
              sub={`${a.responded} invitations responded`}
              icon={CheckCircle2}
            />
            <Stat
              label="Maybe people"
              value={a.maybe}
              sub="Plans still taking shape"
              icon={Clock}
            />
            <Stat
              label="Awaiting response"
              value={a.pending}
              sub={`${a.declined} invited people declined`}
              icon={Users}
            />
            <Stat
              label="Provisional estimate"
              value={a.expected}
              sub={`${a.recommended} plates with contingency`}
              icon={Leaf}
            />
          </div>
          <div className="two-col">
            <div className="panel">
              <h2>Share a little joy.</h2>
              <p className="muted" style={{ fontSize: 12 }}>
                Your public invitation link
              </p>
              <div className="link-box">
                <code>{url}</code>
                <Button size="sm" variant="outline" onClick={() => copy(url)}>
                  <Copy size={13} />
                  Copy
                </Button>
              </div>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`You're invited to ${e.title}! ${url}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send size={13} />
                  Share on WhatsApp
                </a>
              </Button>
              <p className="notice" style={{ marginTop: 20 }}>
                Public links are easy to share, but cannot identify invited
                nonresponders. Use guest-specific links for reliable pending
                counts.
              </p>
              <h3 style={{ marginTop: 24 }}>The details</h3>
              <p className="muted" style={{ fontSize: 12 }}>
                {e.host}
                <br />
                {e.venue}
                <br />
                {e.address}
                <br />
                {e.timezone}
              </p>
            </div>
            <div className="panel">
              <h3>Latest replies</h3>
              {activities.length ? (
                activities.map((g: Data) => (
                  <div className="activity" key={g.id}>
                    <span className="dot">
                      <CheckCircle2 size={14} />
                    </span>
                    <div>
                      <p>
                        <strong>{g.name}</strong> ·{" "}
                        {g.rsvp.status === "NO"
                          ? "Declined"
                          : `${g.rsvp.partySize} people · ${g.rsvp.status === "YES" ? "Attending" : "Maybe"}`}
                      </p>
                      <small>{fmtDate(g.rsvp.updatedAt, e.timezone)}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty">
                  <Users size={30} />
                  <p>Your guests’ replies will arrive here.</p>
                </div>
              )}
              <p className="muted" style={{ fontSize: 10 }}>
                Refreshes every 15 seconds.
              </p>
            </div>
          </div>
        </>
      )}
      {tab === "Guests" && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2 style={{ marginBottom: 5 }}>Your people.</h2>
              <small>
                {a.invitations} invitation records · {a.invited} tracked invited
                people
              </small>
            </div>
            <Button
              size="sm"
              onClick={() =>
                setGuest({
                  name: "",
                  email: "",
                  phone: "",
                  household: "",
                  invitedSize: 1,
                })
              }
            >
              <Plus size={14} />
              Add guest or family
            </Button>
          </div>
          <div className="toolbar">
            <input
              className="input"
              aria-label="Search guests"
              placeholder="Search guests or households…"
              value={search}
              onChange={(v) => setSearch(v.target.value)}
            />
            <select
              className="input"
              aria-label="Filter responses"
              value={filter}
              onChange={(v) => setFilter(v.target.value)}
            >
              <option value="ALL">All responses</option>
              <option value="YES">Attending</option>
              <option value="MAYBE">Maybe</option>
              <option value="NO">Declined</option>
              <option value="PENDING">Pending</option>
            </select>
            <Button variant="outline" size="sm" onClick={exportGuests}>
              <Download size={13} />
              Export
            </Button>
            <label
              className="button btn-outline small"
              style={{ cursor: "pointer" }}
            >
              <Upload size={13} />
              Import CSV
              <input
                className="hidden-label"
                type="file"
                accept=".csv,text/csv"
                onChange={async (ev) => {
                  const f = ev.target.files?.[0];
                  if (!f) return;
                  setImportErrors("");
                  try {
                    if (f.size > 500000)
                      throw Error("Maximum CSV size is 500 KB");
                    const result = await api(
                      `events/${id}/guests/import`,
                      "POST",
                      { csv: await f.text() },
                    );
                    toast.success(`${result.imported} guests imported`);
                    load();
                  } catch (err) {
                    setImportErrors((err as Error).message);
                  }
                  ev.target.value = "";
                }}
              />
            </label>
          </div>
          <button
            className="icon-button"
            style={{ fontSize: 11, marginBottom: 15 }}
            onClick={() =>
              download("evently-guest-template.csv", [
                ["name", "email", "phone", "household", "invitedSize"],
                ["Priya Kapoor", "", "", "Kapoor family", "4"],
              ])
            }
          >
            Download CSV template ↓
          </button>
          {importErrors && (
            <div className="error-box" style={{ whiteSpace: "pre-line" }}>
              {importErrors}
            </div>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Guest / household</th>
                  <th>Invited</th>
                  <th>Response</th>
                  <th>Party size</th>
                  <th>Meal</th>
                  <th>Last reply</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g: Data) => (
                  <tr key={g.id}>
                    <td>
                      {g.name}
                      <small>
                        {g.household?.name ||
                          g.email ||
                          g.phone ||
                          "No contact details"}
                      </small>
                    </td>
                    <td>{g.source === "OPEN" ? "Open link" : g.invitedSize}</td>
                    <td>
                      <span
                        className={`badge ${g.rsvp?.status === "MAYBE" || !g.rsvp ? "draft" : ""}`}
                      >
                        {g.rsvp?.status === "YES"
                          ? "Attending"
                          : g.rsvp?.status === "MAYBE"
                            ? "Maybe"
                            : g.rsvp?.status === "NO"
                              ? "Declined"
                              : "Pending"}
                      </span>
                      {g.revoked && <small>Link revoked</small>}
                    </td>
                    <td>{g.rsvp?.partySize ?? "—"}</td>
                    <td>{g.rsvp?.meal || "—"}</td>
                    <td>
                      {g.rsvp ? fmtDate(g.rsvp.updatedAt, e.timezone) : "—"}
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={`Edit ${g.name}`}
                        onClick={() =>
                          setGuest({ ...g, household: g.household?.name || "" })
                        }
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Delete ${g.name}`}
                        onClick={() => setRemove(g)}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Copy invitation for ${g.name}`}
                        onClick={() => copy(inviteLink(g))}
                      >
                        <Copy size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!guests.length && (
            <div className="empty">
              <Users size={35} />
              <h2>Leave no one out.</h2>
              <p>Add a guest or household, or import your list from a CSV.</p>
            </div>
          )}
        </section>
      )}
      {tab === "Invitations" && (
        <>
          <div className="two-col">
            <div className="panel">
              <h2>One link, all the joy.</h2>
              <p className="muted">Your public event invitation</p>
              <div className="link-box">
                <code>{url}</code>
                <Button size="sm" variant="outline" onClick={() => copy(url)}>
                  <Copy size={13} />
                </Button>
              </div>
              <p className="notice">
                Public replies are identified by a private response token saved
                in the guest’s browser. The number of nonresponders is unknown
                for public links.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRemove({ rotate: true })}
              >
                Replace public link
              </Button>
            </div>
            <div className="panel">
              <Art event={e} />
              <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/invite/${e.publicToken}`}>
                    Preview invitation <ExternalLink size={12} />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/events/${id}/edit`}>
                    Change design
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <section className="panel">
            <h2>A personal invitation.</h2>
            <p className="muted" style={{ fontSize: 12 }}>
              Each household has a secure, unique link. Copying or sharing marks
              it as prepared for sending; delivery is not tracked.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Guest / family</th>
                    <th>People</th>
                    <th>Response</th>
                    <th>Share invitation</th>
                  </tr>
                </thead>
                <tbody>
                  {e.invitations
                    .filter((g: Data) => g.source === "TRACKED")
                    .map((g: Data) => (
                      <tr key={g.id}>
                        <td>{g.name}</td>
                        <td>{g.invitedSize}</td>
                        <td>
                          {g.revoked ? "Revoked" : g.rsvp?.status || "Pending"}
                        </td>
                        <td style={{ display: "flex", gap: 8 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              await api(`events/${id}/invitations`, "POST", {
                                guestId: g.id,
                              });
                              copy(inviteLink(g));
                              load();
                            }}
                          >
                            <Copy size={12} />
                            Copy link
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`https://wa.me/?text=${encodeURIComponent(`${g.name}, you're invited to ${e.title}! ${inviteLink(g)}`)}`}
                            >
                              <Send size={12} />
                              WhatsApp
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              await api(`events/${id}/invitations`, "POST", {
                                guestId: g.id,
                                revoke: !g.revoked,
                              });
                              load();
                            }}
                          >
                            {g.revoked ? "Restore" : "Revoke"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setTab("Guests");
                setGuest({
                  name: "",
                  email: "",
                  phone: "",
                  household: "",
                  invitedSize: 1,
                });
              }}
            >
              <Plus size={13} />
              Add a guest invitation
            </Button>
          </section>
        </>
      )}
      {tab === "Analytics" && (
        <>
          <div className="stats">
            <Stat
              label="Tracked invited people"
              value={a.invited}
              sub={`${a.invitations} total invitation records`}
              icon={Users}
            />
            <Stat
              label="Invitations responded"
              value={a.responded}
              sub={`${a.completion}% response completion`}
              icon={CheckCircle2}
            />
            <Stat
              label="People represented"
              value={a.represented}
              sub="Yes + maybe + declined invited sizes"
              icon={Users}
            />
            <Stat
              label="Expected attendance"
              value={a.expected}
              sub="Provisional · editable assumptions"
              icon={Leaf}
            />
          </div>
          <div className="two-col">
            <section className="panel">
              <h3>People by response</h3>
              <div className="chart">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Confirmed", value: a.confirmed },
                        { name: "Maybe", value: a.maybe },
                        { name: "Declined", value: a.declined },
                        { name: "Pending", value: a.pending },
                      ]}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {["#527a58", "#c5aa73", "#d8b6aa", "#e5eadc"].map((c) => (
                        <Cell key={c} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                className="event-counts"
                style={{ justifyContent: "space-around" }}
              >
                {[
                  ["Confirmed", a.confirmed],
                  ["Maybe", a.maybe],
                  ["Declined", a.declined],
                  ["Pending", a.pending],
                ].map(([l, v]) => (
                  <div key={l}>
                    <strong>{v}</strong>
                    <small>{l}</small>
                  </div>
                ))}
              </div>
            </section>
            <section className="panel">
              <h3>Response trend · first response date</h3>
              <div className="chart">
                <ResponsiveContainer>
                  <BarChart data={a.trend}>
                    <CartesianGrid vertical={false} stroke="#edf0e7" />
                    <XAxis dataKey="date" fontSize={10} />
                    <YAxis allowDecimals={false} fontSize={10} />
                    <Tooltip />
                    <Bar
                      dataKey="responses"
                      fill="#7f9b70"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
          <div className="two-col">
            <section className="panel">
              <h2>Assumptions, in the open.</h2>
              <p className="muted" style={{ fontSize: 12 }}>
                Expected = confirmed × probability + maybe × probability +
                pending tracked people × probability + adjustment.
              </p>
              <form
                onSubmit={(ev) => {
                  ev.preventDefault();
                  const b = Object.fromEntries(new FormData(ev.currentTarget));
                  saveSettings(
                    Object.fromEntries(
                      Object.entries(b).map(([k, v]) => [k, Number(v)]),
                    ),
                  );
                }}
              >
                <div className="fields">
                  {[
                    [
                      "confirmedProbability",
                      "Confirmed attendance probability",
                      1,
                    ],
                    ["maybeProbability", "Maybe attendance probability", 1],
                    ["pendingProbability", "Pending attendance probability", 1],
                    ["adjustment", "Manual adjustment (people)", 10000],
                    ["contingency", "Catering contingency (%)", 100],
                  ].map(([k, l, max]) => (
                    <Field label={String(l)} key={k}>
                      <input
                        name={String(k)}
                        type="number"
                        step={String(k).includes("Probability") ? 0.01 : 1}
                        min={k === "adjustment" ? -10000 : 0}
                        max={Number(max)}
                        defaultValue={e.settings[k]}
                      />
                    </Field>
                  ))}
                </div>
                <Button disabled={busy}>Save assumptions</Button>
              </form>
              <p className="notice">
                Unknown public invitees are excluded from pending counts.
                Estimates are provisional, not statistically calibrated
                forecasts. Suggested catering:{" "}
                <strong>{a.recommended} plates</strong>.
              </p>
            </section>
            <section className="panel">
              <h3>Meal preference · confirmed people</h3>
              {Object.entries(a.meals).map(([meal, count]: Data) => (
                <div
                  key={meal}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "18px 0",
                    borderBottom: "1px solid #edf0e7",
                  }}
                >
                  <span>{meal}</span>
                  <strong>{count}</strong>
                </div>
              ))}
              <p className="muted" style={{ fontSize: 11 }}>
                Each response records one preference for the whole party.
                Session-specific selections can be adjusted through the
                invitation.
              </p>
              <p className="muted" style={{ fontSize: 11 }}>
                {a.sent} invitations marked prepared for sharing. This is not
                delivery confirmation.
              </p>
            </section>
          </div>
        </>
      )}
      {tab === "Catering" && (
        <>
          <div className="page-heading">
            <div>
              <h2 style={{ marginBottom: 5 }}>A thoughtfully set table.</h2>
              <p>
                Plan each meal separately. Attendees are never added across
                sessions.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSession({ title: "", startsAt: e.startsAt })}
            >
              <Plus size={14} />
              Add meal session
            </Button>
          </div>
          {e.sessions.map((s: Data) => {
            const p = s.plans[0];
            const count = p
              ? (p.overrideCount ??
                Math.ceil(p.expected * (1 + p.contingency / 100)))
              : a.recommended;
            return (
              <section className="panel" key={s.id}>
                <div className="panel-heading">
                  <div>
                    <h2 style={{ marginBottom: 4 }}>{s.title}</h2>
                    <small>{fmtDate(s.startsAt, e.timezone)}</small>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      setPlan(
                        p || {
                          sessionId: s.id,
                          expected: a.expected,
                          pricePerPlate: 0,
                          contingency: e.settings.contingency,
                          overrideCount: null,
                          vegetarian: a.meals.Vegetarian || 0,
                          nonVegetarian: a.meals["Non-vegetarian"] || 0,
                          originalCount: a.invited,
                          mealType: "Buffet",
                        },
                      )
                    }
                  >
                    <Pencil size={13} />
                    {p ? "Edit plan" : "Create plan"}
                  </Button>
                </div>
                <div className="stats" style={{ marginBottom: 0 }}>
                  <Stat
                    label="Expected for this meal"
                    value={p?.expected ?? a.expected}
                    sub={
                      p
                        ? "Stored organiser plan"
                        : "Event estimate · verify for this session"
                    }
                    icon={Users}
                  />
                  <Stat
                    label="Suggested / chosen plates"
                    value={count}
                    sub={
                      p?.overrideCount !== null && p
                        ? "Manual quantity override"
                        : "Includes contingency"
                    }
                    icon={Utensils}
                  />
                  <Stat
                    label="Estimated meal cost"
                    value={money(count * (p?.pricePerPlate || 0))}
                    sub={
                      p
                        ? `${money(p.pricePerPlate)} per plate`
                        : "Set your plate price"
                    }
                    icon={Leaf}
                  />
                  <Stat
                    label="Illustrative cost difference"
                    value={money(
                      p ? (p.originalCount - count) * p.pricePerPlate : 0,
                    )}
                    sub="Original plan minus current plan"
                    icon={CalendarDays}
                  />
                </div>
                {p && (
                  <>
                    <p className="notice">
                      {p.mealType} · Vegetarian: {p.vegetarian} ·
                      Non-vegetarian: {p.nonVegetarian} · Other/unassigned:{" "}
                      {p.expected - p.vegetarian - p.nonVegetarian}. Original
                      budget: {money(p.originalCount * p.pricePerPlate)}. Cost
                      differences are illustrative and are not guaranteed
                      savings.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        download("evently-catering.csv", [
                          [
                            "Session",
                            "Expected",
                            "Plates",
                            "Price per plate INR",
                            "Cost INR",
                            "Original budget INR",
                            "Illustrative difference INR",
                            "Vegetarian",
                            "Non-vegetarian",
                          ],
                          [
                            s.title,
                            p.expected,
                            count,
                            p.pricePerPlate,
                            count * p.pricePerPlate,
                            p.originalCount * p.pricePerPlate,
                            (p.originalCount - count) * p.pricePerPlate,
                            p.vegetarian,
                            p.nonVegetarian,
                          ],
                        ])
                      }
                    >
                      <Download size={13} />
                      Download summary
                    </Button>
                  </>
                )}
              </section>
            );
          })}
        </>
      )}
      {tab === "Settings" && (
        <div className="panel">
          <h2>Keep your celebration in your hands.</h2>
          <label className="check">
            <input
              type="checkbox"
              checked={e.settings.rsvpEnabled}
              onChange={(ev) =>
                saveSettings({ rsvpEnabled: ev.target.checked })
              }
              disabled={busy}
            />
            Accept RSVP responses
          </label>
          <p className="muted" style={{ fontSize: 12 }}>
            Deadline:{" "}
            {e.settings.deadline
              ? fmtDate(e.settings.deadline, e.timezone)
              : "No deadline"}{" "}
            · Time zone: {e.timezone}
          </p>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/events/${id}/edit`}>
              Edit event and RSVP settings
            </Link>
          </Button>
          {e.status === "DRAFT" && (
            <Button
              style={{ marginLeft: 10 }}
              onClick={async () => {
                await api(`events/${id}`, "PATCH", {
                  ...e,
                  status: "PUBLISHED",
                });
                load();
                toast.success("Event published");
              }}
            >
              Publish event
            </Button>
          )}
          <hr
            style={{
              border: 0,
              borderTop: "1px solid #e5e9e1",
              margin: "35px 0",
            }}
          />
          <h3>Delete this event</h3>
          <p className="muted">
            This permanently removes its guests, invitations, responses and meal
            plans.
          </p>
          <Button
            variant="destructive"
            onClick={() => setRemove({ event: true })}
          >
            Delete event
          </Button>
        </div>
      )}
      {guest && (
        <Modal
          title={guest.id ? "Edit guest" : "Add a guest or family"}
          close={() => setGuest(null)}
        >
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              setBusy(true);
              try {
                await api(
                  `events/${id}/guests${guest.id ? `/${guest.id}` : ""}`,
                  guest.id ? "PATCH" : "POST",
                  guest,
                );
                setGuest(null);
                toast.success("Guest saved");
                load();
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {[
              ["name", "Guest name"],
              ["household", "Household / family (optional)"],
              ["email", "Email (optional)"],
              ["phone", "Phone (optional)"],
              ["invitedSize", "Invited party size"],
            ].map(([key, label]) => (
              <Field label={label} key={key}>
                <input
                  required={key === "name" || key === "invitedSize"}
                  type={
                    key === "invitedSize"
                      ? "number"
                      : key === "email"
                        ? "email"
                        : "text"
                  }
                  min={1}
                  max={100}
                  value={guest[key] || ""}
                  onChange={(v) =>
                    setGuest({
                      ...guest,
                      [key]:
                        key === "invitedSize"
                          ? Number(v.target.value)
                          : v.target.value,
                    })
                  }
                />
              </Field>
            ))}
            <p className="notice">
              A household invitation represents the total number of people
              entered here, including the respondent.
            </p>
            <Button disabled={busy}>Save guest</Button>
          </form>
        </Modal>
      )}
      {remove && (
        <Modal
          title={
            remove.rotate
              ? "Replace public link?"
              : remove.event
                ? "Delete event permanently?"
                : `Remove ${remove.name}?`
          }
          close={() => setRemove(null)}
        >
          <p>
            {remove.rotate
              ? "The previous public link will stop working. Existing guest-specific links remain valid."
              : "This permanently removes the selected record and its related responses."}
          </p>
          <div className="form-actions">
            <Button variant="outline" onClick={() => setRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  if (remove.rotate)
                    await api(`events/${id}/invitations`, "POST", {
                      rotatePublic: true,
                    });
                  else
                    await api(
                      remove.event
                        ? `events/${id}`
                        : `events/${id}/guests/${remove.id}`,
                      "DELETE",
                    );
                  if (remove.event) router.push("/dashboard");
                  else load();
                  setRemove(null);
                  toast.success("Done");
                } catch (err) {
                  toast.error((err as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {remove.rotate ? "Replace link" : "Delete permanently"}
            </Button>
          </div>
        </Modal>
      )}
      {plan && (
        <Modal title="Plan this meal" close={() => setPlan(null)}>
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              setBusy(true);
              try {
                await api(`events/${id}/catering`, "PUT", plan);
                setPlan(null);
                toast.success("Meal plan saved");
                load();
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="fields">
              {[
                ["expected", "Expected attendance"],
                ["pricePerPlate", "Price per plate (₹)"],
                ["contingency", "Contingency (%)"],
                ["originalCount", "Original planned people"],
                ["vegetarian", "Vegetarian people"],
                ["nonVegetarian", "Non-vegetarian people"],
                ["overrideCount", "Override plates (optional)"],
              ].map(([k, label]) => (
                <Field label={label} key={k}>
                  <input
                    type="number"
                    min={0}
                    max={k === "contingency" ? 100 : 1000000}
                    step={k === "pricePerPlate" ? ".01" : "1"}
                    required={k !== "overrideCount"}
                    value={plan[k] ?? ""}
                    onChange={(v) =>
                      setPlan({
                        ...plan,
                        [k]:
                          v.target.value === "" ? null : Number(v.target.value),
                      })
                    }
                  />
                </Field>
              ))}
            </div>
            <Field label="Meal type">
              <select
                value={plan.mealType}
                onChange={(ev) =>
                  setPlan({ ...plan, mealType: ev.target.value })
                }
              >
                <option>Buffet</option>
                <option>Plated meal</option>
                <option>Traditional thali</option>
                <option>Snacks & refreshments</option>
              </select>
            </Field>
            <p className="notice">
              Verify expected attendance for this session. Guests attending
              lunch and dinner are counted once within each meal plan.
            </p>
            <Button disabled={busy}>Save meal plan</Button>
          </form>
        </Modal>
      )}
      {session && (
        <Modal title="Add a meal session" close={() => setSession(null)}>
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              try {
                await api(`events/${id}/sessions`, "POST", session);
                setSession(null);
                load();
                toast.success("Session added");
              } catch (err) {
                toast.error((err as Error).message);
              }
            }}
          >
            <Field label="Session name">
              <input
                value={session.title}
                onChange={(ev) =>
                  setSession({ ...session, title: ev.target.value })
                }
                placeholder="Reception dinner"
                required
              />
            </Field>
            <Field label="Session date & time (UTC)">
              <input
                type="datetime-local"
                required
                value={session.startsAt.slice(0, 16)}
                onChange={(ev) =>
                  setSession({
                    ...session,
                    startsAt: new Date(ev.target.value + "Z").toISOString(),
                  })
                }
              />
            </Field>
            <Button>Add session</Button>
          </form>
        </Modal>
      )}
    </>
  );
}
