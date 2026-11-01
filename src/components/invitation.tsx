"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, Copy } from "lucide-react";
import { api, Field, fmtDate, type Data } from "./shared";
import { VeyraMark } from "./brand";
import { InvitationDesign } from "./invitation-design";
import { Button } from "./ui/button";
export function Invitation({ token }: { token: string }) {
  const [data, setData] = useState<Data>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [privateToken, setPrivateToken] = useState("");
  const [form, setForm] = useState<Data>({
    name: "",
    status: "YES",
    partySize: 1,
    meal: "Vegetarian",
    message: "",
    selections: [],
  });
  useEffect(() => {
    const stored =
      new URLSearchParams(location.search).get("responseToken") ||
      localStorage.getItem(`evently-rsvp-${token}`) ||
      Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) =>
        v.toString(16).padStart(2, "0"),
      ).join("");
    localStorage.setItem(`evently-rsvp-${token}`, stored);
    setPrivateToken(stored);
    api(`invitations/${token}${stored ? `?responseToken=${stored}` : ""}`)
      .then((d) => {
        setData(d);
        setForm((f: Data) => ({
          ...f,
          name: d.guest?.name || d.respondentName || "",
          ...(d.response
            ? { ...d.response, partySize: d.response.partySize || 1 }
            : {}),
          selections: d.event.sessions.map((s: Data) => ({
            sessionId: s.id,
            attendees:
              d.response?.selections?.find((v: Data) => v.sessionId === s.id)
                ?.attendees ??
              (d.response
                ? 0
                : s.rsvpEnabled &&
                    !(s.deadline && new Date(s.deadline) < new Date())
                  ? 1
                  : 0),
            meal:
              d.response?.selections?.find((v: Data) => v.sessionId === s.id)
                ?.meal ||
              d.response?.meal ||
              "Vegetarian",
          })),
        }));
      })
      .catch((e) => setError(e.message));
  }, [token]);
  const update = (k: string, v: Data) =>
    setForm((f: Data) => ({ ...f, [k]: v }));
  if (!data)
    return (
      <div className="invitation-page">
        <div className="invitation-paper">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <VeyraMark size={40} />
          </div>
          {error ? (
            <>
              <h1>Something’s missing.</h1>
              <p>{error}</p>
              <p className="muted">
                Please ask your host for an updated invitation link.
              </p>
              <Link href="/">Visit Veyra →</Link>
            </>
          ) : (
            <div className="loading" style={{ marginTop: 30 }} />
          )}
        </div>
      </div>
    );
  const e = data.event,
    s = e.settings;
  const closed =
    !s.rsvpEnabled || (s.deadline && new Date(s.deadline) < new Date());
  return (
    <div
      className="invitation-page"
      style={{
        background:
          e.theme === "rose"
            ? "#f0e4df"
            : e.theme === "gold"
              ? "#eee7d6"
              : undefined,
      }}
    >
      <InvitationDesign event={e}>
        <div className="rsvp-form">
          {closed ? (
            <div className="notice">
              <h3>Responses are now closed.</h3>Please contact your host if your
              plans have changed.
            </div>
          ) : success ? (
            <div className="success" style={{ textAlign: "center" }}>
              <CheckCircle2 size={34} strokeWidth={1} />
              <h2>
                {form.status === "NO"
                  ? "We’ll miss you."
                  : "You’re on the list."}
              </h2>
              <p>
                Your response has been saved.{" "}
                {form.status !== "NO" &&
                  `${form.partySize} ${form.partySize === 1 ? "person" : "people"} · ${form.status === "YES" ? "Attending" : "Maybe attending"}`}
              </p>
              <Button variant="outline" onClick={() => setSuccess(false)}>
                Update my response
              </Button>
              {!data.guest && (
                <>
                  <p style={{ fontSize: 11 }}>
                    Save your private update link to edit from another device.
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `${location.origin}/invite/${token}?responseToken=${privateToken}`,
                      );
                      toast.success("Private update link copied");
                    }}
                  >
                    <Copy size={12} />
                    Copy my update link
                  </Button>
                </>
              )}
            </div>
          ) : (
            <form
              onSubmit={async (ev) => {
                ev.preventDefault();
                setBusy(true);
                setError("");
                try {
                  const result = await api(
                    `invitations/${token}/rsvp`,
                    "POST",
                    {
                      ...form,
                      partySize:
                        form.status === "NO" ? 0 : Number(form.partySize),
                      responseToken: privateToken || undefined,
                      selections: form.selections.map((v: Data) => ({
                        ...v,
                        attendees:
                          form.status === "NO"
                            ? 0
                            : Math.min(v.attendees, form.partySize),
                        meal: form.meal,
                      })),
                    },
                  );
                  localStorage.setItem(
                    `evently-rsvp-${token}`,
                    result.responseToken,
                  );
                  setPrivateToken(result.responseToken);
                  setSuccess(true);
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <h2 style={{ textAlign: "center" }}>Will you be attending?</h2>
              <p
                className="muted"
                style={{ fontSize: 12, textAlign: "center" }}
              >
                We’d love to celebrate with you.
                {s.deadline && (
                  <>
                    <br />
                    Kindly reply by {fmtDate(s.deadline, e.timezone)}.
                  </>
                )}
              </p>
              {data.guest ? (
                <p className="notice">
                  {data.guest.source === "OPEN"
                    ? "Self-reported response for "
                    : "An invitation for "}{" "}
                  <strong>{data.guest.name}</strong> · Up to{" "}
                  {Math.min(data.guest.invitedSize, s.maxPartySize)} people
                </p>
              ) : (
                <>
                  <p className="notice">
                    Open invitation · your response is self-reported and is not
                    a verified invited household.
                  </p>
                  <Field label="Your name">
                    <input
                      value={form.name}
                      onChange={(v) => update("name", v.target.value)}
                      required
                      maxLength={120}
                      autoComplete="name"
                    />
                  </Field>
                </>
              )}
              <div className="rsvp-options">
                {[
                  ["YES", "Joyfully, yes"],
                  ...(s.allowMaybe ? [["MAYBE", "Maybe"]] : []),
                  ["NO", "Regretfully, no"],
                ].map(([v, label]) => (
                  <Button
                    key={v}
                    type="button"
                    variant="outline"
                    className={form.status === v ? "chosen" : ""}
                    aria-pressed={form.status === v}
                    onClick={() => update("status", v)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              {form.status !== "NO" && (
                <>
                  {s.allowPartySize && (
                    <Field label="Number attending, including you">
                      <input
                        type="number"
                        min={1}
                        max={Math.min(
                          data.guest?.invitedSize || s.maxPartySize,
                          s.maxPartySize,
                        )}
                        required
                        value={form.partySize}
                        onChange={(v) =>
                          setForm({
                            ...form,
                            partySize: Number(v.target.value),
                            selections: form.selections.map(
                              (selection: Data) => ({
                                ...selection,
                                attendees:
                                  e.sessions.length === 1 &&
                                  e.sessions[0].rsvpEnabled
                                    ? Number(v.target.value)
                                    : Math.min(
                                        selection.attendees,
                                        Number(v.target.value),
                                      ),
                              }),
                            ),
                          })
                        }
                      />
                    </Field>
                  )}
                  {s.mealsEnabled && (
                    <Field label="Meal preference">
                      <select
                        value={form.meal}
                        onChange={(v) => update("meal", v.target.value)}
                      >
                        <option>Vegetarian</option>
                        <option>Non-vegetarian</option>
                        <option>No preference</option>
                      </select>
                    </Field>
                  )}
                  {e.sessions.length > 0 && (
                    <>
                      <h3>Which celebrations will you join?</h3>
                      {e.sessions.map((session: Data) => (
                        <Field
                          label={`${session.title} · attendees`}
                          hint={`${fmtDate(session.startsAt, e.timezone)} · ${new Date(session.startsAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: e.timezone })} · ${session.venue || e.venue}${!session.rsvpEnabled ? " · Responses closed" : ""}`}
                          key={session.id}
                        >
                          <input
                            type="number"
                            min={0}
                            max={form.partySize}
                            disabled={
                              !session.rsvpEnabled ||
                              !!(
                                session.deadline &&
                                new Date(session.deadline) < new Date()
                              )
                            }
                            value={
                              form.selections.find(
                                (v: Data) => v.sessionId === session.id,
                              )?.attendees || 0
                            }
                            onChange={(ev) =>
                              update(
                                "selections",
                                form.selections.map((v: Data) =>
                                  v.sessionId === session.id
                                    ? {
                                        ...v,
                                        attendees: Number(ev.target.value),
                                      }
                                    : v,
                                ),
                              )
                            }
                          />
                        </Field>
                      ))}
                    </>
                  )}
                </>
              )}
              {s.messagesEnabled && (
                <Field label="A message for your host (optional)">
                  <textarea
                    value={form.message}
                    onChange={(v) => update("message", v.target.value)}
                    maxLength={1000}
                  />
                </Field>
              )}
              {error && (
                <div className="error-box" role="alert">
                  {error}
                </div>
              )}
              <Button disabled={busy} style={{ width: "100%" }}>
                {busy
                  ? "Saving your response…"
                  : data.response
                    ? "Update response"
                    : e.rsvpLabel || "Send my RSVP"}
                <ArrowRight size={14} />
              </Button>
              <p
                style={{
                  fontSize: 10,
                  textAlign: "center",
                  color: "var(--muted-text)",
                  lineHeight: 1.8,
                }}
              >
                Your response is shared only with the event organiser.
                <br />
                Please keep this invitation link private.{" "}
                <Link href="/privacy" style={{ textDecoration: "underline" }}>
                  Privacy notice
                </Link>
              </p>
            </form>
          )}
        </div>
      </InvitationDesign>
      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "var(--muted-text)",
          marginTop: 25,
        }}
      >
        Created with{" "}
        <Link href="/" className="invitation-attribution">
          Veyra
        </Link>
      </p>
    </div>
  );
}
