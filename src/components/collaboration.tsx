"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, Field, type Data, fmtDate } from "./shared";
import { Button } from "./ui/button";
export function Collaborators({ eventId }: { eventId: string }) {
  const [rows, setRows] = useState<Data[]>([]),
    [email, setEmail] = useState(""),
    [role, setRole] = useState("MANAGER"),
    [link, setLink] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      api(`events/${eventId}/collaborators`)
        .then(setRows)
        .catch((e) => setError(e.message)),
    [eventId],
  );
  useEffect(() => {
    load();
  }, [load]);
  return (
    <section className="panel">
      <h2>Family and professional access</h2>
      <p>
        Managers can edit event details, guests, RSVPs and check-ins. Viewers
        see reports only. Partners see catering summaries without guest names,
        contacts or private messages. Only the owner controls access and event
        deletion.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const result = await api(
              `events/${eventId}/collaborators`,
              "POST",
              { email, role },
            );
            setLink(result.invitationUrl);
            await load();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="fields">
          <Field label="Invited account email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Access role">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="MANAGER">Manager</option>
              <option value="VIEWER">Viewer</option>
              <option value="PARTNER">Catering partner</option>
            </select>
          </Field>
        </div>
        <Button disabled={busy}>Create secure access invitation</Button>
      </form>
      {link && (
        <div className="notice">
          <p>
            Share this link privately with the invited person. It expires in
            seven days. They must sign in with the exact invited email.
            Re-inviting resets existing access until accepted.
          </p>
          <input
            className="input"
            aria-label="Collaborator invitation link"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      )}
      {rows.map((r) => (
        <div className="function-card" key={r.id}>
          <strong>{r.email}</strong>
          <p>
            {r.role} ·{" "}
            {r.acceptedAt
              ? "Accepted"
              : `Awaiting acceptance · expires ${fmtDate(r.expiresAt)}`}
          </p>
          <Button
            variant="outline"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api(`events/${eventId}/collaborators/${r.id}`, "DELETE");
                await load();
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Revoke access
          </Button>
        </div>
      ))}
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
    </section>
  );
}
export function AcceptCollaboration() {
  const router = useRouter();
  const [token, setToken] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setToken(
      new URLSearchParams(location.search).get("collaborationToken") || "",
    );
  }, []);
  if (!token) return null;
  return (
    <section className="panel">
      <h2>Accept event access</h2>
      <p>
        Accept only if you expected this invitation. Sign in with the email used
        by the event owner.
      </p>
      <Button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const result = await api(`collaborations/${token}`, "POST", {});
            router.push(
              result.role === "PARTNER"
                ? "/dashboard/partners"
                : `/dashboard/events/${result.eventId}`,
            );
          } catch (e) {
            setMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Accept invitation
      </Button>
      {message && (
        <p role="alert" className="error-box">
          {message}
        </p>
      )}
    </section>
  );
}
export function PartnerWorkspace() {
  const [events, setEvents] = useState<Data[] | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    api("partner-events")
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <h1>Partner workspace</h1>
      <p>
        Only events explicitly assigned to your account appear here. These
        summaries contain planning data without guest lists or contact details.
      </p>
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
      {!events && !error && <div className="loading" />}
      {events?.length === 0 && (
        <section className="panel">
          No assigned events. Ask the organiser for a partner access invitation.
        </section>
      )}
      {events?.map((e) => (
        <section className="panel" key={e.id}>
          <h2>{e.title}</h2>
          <p>{fmtDate(e.startsAt, e.timezone)}</p>
          {e.functions.map((s: Data, i: number) => (
            <div className="function-card" key={i}>
              <h3>{s.title}</h3>
              <p>
                {fmtDate(s.startsAt, e.timezone)} · {s.confirmed} confirmed ·{" "}
                {s.expected} expected estimate · {s.suggested} suggested plates
              </p>
              {Object.entries(s.meals).map(([k, v]) => (
                <p key={k}>
                  {k}: {String(v)}
                </p>
              ))}
              <p>{s.planningNotes}</p>
              <small>
                Calculated / plan saved:{" "}
                {new Date(s.calculatedAt).toLocaleString("en-IN")}
              </small>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
export function Notifications() {
  const [rows, setRows] = useState<Data[]>([]),
    [error, setError] = useState("");
  const load = useCallback(
    () =>
      api("notifications")
        .then(setRows)
        .catch((e) => setError(e.message)),
    [],
  );
  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);
  return (
    <>
      <h1>Notifications</h1>
      <p>
        {rows.filter((r) => !r.readAt).length} unread · refreshes every 15
        seconds
      </p>
      {!rows.length && (
        <section className="panel">
          Your event updates will appear here.
        </section>
      )}
      {rows.map((r) => (
        <section className="panel" key={r.id}>
          <strong>{r.message}</strong>
          <p>{new Date(r.createdAt).toLocaleString("en-IN")}</p>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await api("notifications", "PATCH", {
                  id: r.id,
                  read: !r.readAt,
                });
                await load();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            {r.readAt ? "Mark unread" : "Mark read"}
          </Button>
        </section>
      ))}
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
export function ProfileSettings({ user }: { user: Data }) {
  const router = useRouter();
  const [name, setName] = useState(user.name),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <section className="panel">
        <h2>Your profile</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await api("auth/profile", "PATCH", { name });
              setMessage(
                "Profile saved. Your updated name appears after refresh.",
              );
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Profile name">
            <input
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Button disabled={busy}>Save profile</Button>
        </form>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const data = await api("auth/export");
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = `veyra-data-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Export my account data
        </Button>
      </section>
      <section className="panel">
        <h2>Change password</h2>
        <p>Changing your password signs out all devices, including this one.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await api(
                "auth/password",
                "POST",
                Object.fromEntries(new FormData(e.currentTarget)),
              );
              router.push("/login");
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field label="Current password">
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <Field label="New password">
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              required
            />
          </Field>
          <Button disabled={busy}>Change password</Button>
        </form>
      </section>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
    </>
  );
}
export function ReadOnlyEvent({ event: e }: { event: Data }) {
  return (
    <>
      <h1>{e.title}</h1>
      <p>Viewer access · {fmtDate(e.startsAt, e.timezone)}</p>
      <section className="panel">
        <h2>Event overview</h2>
        <p>
          {e.analytics.invited} invited people · {e.analytics.confirmed}{" "}
          confirmed · {e.analytics.maybe} maybe · {e.analytics.pending} pending
        </p>
        <p>
          {e.analytics.completion}% RSVP completion · {e.analytics.expected}{" "}
          estimated attendance
        </p>
      </section>
      {e.analytics.functions.map((s: Data) => (
        <section className="panel" key={s.id}>
          <h2>{s.title}</h2>
          <p>
            {s.confirmed} confirmed · {s.actual} actually checked in · {s.maybe}{" "}
            maybe · {s.pending} pending · {s.expected} expected estimate
          </p>
          <p>{s.recommended} suggested plates including contingency</p>
        </section>
      ))}
      <section className="panel">
        <h2>Guest categories</h2>
        {e.analytics.categories.map((c: Data) => (
          <p key={c.name}>
            {c.name} · {c.confirmed} confirmed · {c.invited} invited
          </p>
        ))}
      </section>
    </>
  );
}
