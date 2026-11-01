"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import jsQR from "jsqr";
import { api, Field, type Data, download } from "./shared";
import { Button } from "./ui/button";
export function Reminders({ event: e }: { event: Data }) {
  const [filter, setFilter] = useState("PENDING"),
    [kind, setKind] = useState("RSVP_REMINDER"),
    [rows, setRows] = useState<Data[]>([]),
    [prepared, setPrepared] = useState<Data>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      api(`events/${e.id}/reminders`)
        .then(setRows)
        .catch((err) => setError(err.message)),
    [e.id],
  );
  useEffect(() => {
    load();
  }, [load]);
  return (
    <section className="panel">
      <h2>Invitation reminders</h2>
      <p className="notice">
        This is a manual reminder queue. Prepare a message, review it and open
        WhatsApp to send it yourself. Preparation and opening a share link do
        not establish delivery.
      </p>
      <div className="fields">
        <Field label="Response status">
          <select value={filter} onChange={(v) => setFilter(v.target.value)}>
            {[
              ["PENDING", "Awaiting response"],
              ["YES", "Confirmed"],
              ["NO", "Declined"],
              ["MAYBE", "Maybe"],
              ["ALL", "All"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reminder template">
          <select value={kind} onChange={(v) => setKind(v.target.value)}>
            {[
              ["INITIAL", "Initial invitation"],
              ["RSVP_REMINDER", "RSVP reminder"],
              ["FINAL_CONFIRMATION", "Final confirmation"],
              ["EVENT_DETAILS", "Event details reminder"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {e.invitations
        .filter(
          (i: Data) =>
            i.source === "TRACKED" &&
            !i.revoked &&
            (filter === "ALL" || (i.rsvp?.status || "PENDING") === filter),
        )
        .map((i: Data) => (
          <div key={i.id} className="function-card">
            <div className="panel-heading">
              <div>
                <strong>{i.name}</strong>
                <p>
                  {i.rsvp?.status || "Awaiting response"} ·{" "}
                  {rows.filter((r) => r.invitationId === i.id).length}{" "}
                  preparations
                </p>
              </div>
              <Button
                disabled={busy}
                variant="outline"
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    setPrepared(
                      await api(`events/${e.id}/reminders`, "POST", {
                        invitationId: i.id,
                        kind,
                      }),
                    );
                    await load();
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Prepare reminder
              </Button>
            </div>
          </div>
        ))}
      {prepared && (
        <div className="notice">
          <h3>Review prepared message</h3>
          <p>{prepared.message}</p>
          <Button asChild>
            <a
              href={prepared.shareUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open WhatsApp
            </a>
          </Button>
          <p>
            Prepared {new Date(prepared.preparedAt).toLocaleString("en-IN")} ·
            Delivery unverified
          </p>
        </div>
      )}
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
export function ForecastHistory({ event: e }: { event: Data }) {
  const [rows, setRows] = useState<Data[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      api(`events/${e.id}/forecasts`)
        .then(setRows)
        .catch((err) => setError(err.message)),
    [e.id],
  );
  useEffect(() => {
    load();
  }, [load]);
  return (
    <section className="panel">
      <h2>Recorded catering estimates</h2>
      <p>
        Save a dated estimate using the probabilities and contingency in
        Analytics. Saved estimates retain their original inputs when responses
        change. Public-link pending populations remain unknown.
      </p>
      <Button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            for (const s of e.sessions)
              await api(`events/${e.id}/forecasts`, "POST", {
                sessionId: s.id,
              });
            await load();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Record current estimates
      </Button>
      <Button
        variant="outline"
        disabled={!rows.length}
        onClick={() =>
          download(
            `${e.title.replace(/[^a-z0-9]/gi, "-")}-catering-estimates-${new Date().toISOString().slice(0, 10)}.csv`,
            [
              [
                "Event",
                "Calculated at",
                "Function",
                "Confirmed",
                "Maybe",
                "Pending tracked",
                "Expected estimate",
                "Suggested plates",
                "Confirmed probability",
                "Maybe probability",
                "Pending probability",
                "Contingency percent",
                "Public pending population",
              ],
              ...rows.map((r) => [
                e.title,
                r.calculatedAt,
                r.result.title,
                r.inputs.confirmed,
                r.inputs.maybe,
                r.inputs.pending,
                r.result.expected,
                r.result.recommended,
                r.assumptions.confirmedProbability,
                r.assumptions.maybeProbability,
                r.assumptions.pendingProbability,
                r.assumptions.contingency,
                "Unknown",
              ]),
            ],
          )
        }
      >
        Export estimates without guest data
      </Button>
      {rows.slice(0, 10).map((r) => (
        <div className="function-card" key={r.id}>
          <strong>{r.result.title}</strong>
          <p>
            {r.result.expected} expected · {r.result.recommended} suggested
            plates · {new Date(r.calculatedAt).toLocaleString("en-IN")}
          </p>
          <small>
            Probabilities: {r.assumptions.confirmedProbability} confirmed /{" "}
            {r.assumptions.maybeProbability} maybe /{" "}
            {r.assumptions.pendingProbability} pending ·{" "}
            {r.assumptions.contingency}% contingency
          </small>
        </div>
      ))}
      {!rows.length && <p className="muted">No estimates recorded yet.</p>}
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
    </section>
  );
}
function CameraScanner({
  scanned,
  close,
}: {
  scanned: (value: string) => void;
  close: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false,
      frame = 0;
    let stream: MediaStream | undefined;
    const canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d", { willReadFrequently: true });
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then(async (s) => {
        stream = s;
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        if (video.current) {
          video.current.srcObject = s;
          await video.current.play();
        }
        const scan = () => {
          const v = video.current;
          if (cancelled || !v || !ctx) return;
          if (v.readyState >= 2 && v.videoWidth) {
            const scale = Math.min(1, 800 / v.videoWidth);
            canvas.width = Math.round(v.videoWidth * scale);
            canvas.height = Math.round(v.videoHeight * scale);
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qr = jsQR(image.data, image.width, image.height, {
              inversionAttempts: "dontInvert",
            });
            if (qr) {
              scanned(qr.data);
              return;
            }
          }
          frame = requestAnimationFrame(scan);
        };
        scan();
      })
      .catch(() =>
        setError(
          "Camera unavailable or permission declined. Enter the invitation token manually.",
        ),
      );
    if (!navigator.mediaDevices)
      setError("Camera requires HTTPS or localhost. Use manual entry.");
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanned]);
  return (
    <div>
      <video
        ref={video}
        muted
        playsInline
        style={{ width: "100%", maxHeight: 350 }}
        aria-label="Invitation QR camera"
      />
      {error && <p role="alert">{error}</p>}
      <Button variant="outline" onClick={close}>
        Stop camera
      </Button>
    </div>
  );
}
export function CheckIns({
  event: e,
  saved,
}: {
  event: Data;
  saved: () => void;
}) {
  const [sessionId, setSessionId] = useState(e.sessions[0]?.id || ""),
    [token, setToken] = useState(""),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState(""),
    [count, setCount] = useState(1),
    [reason, setReason] = useState(""),
    [camera, setCamera] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [rows, setRows] = useState<Data[]>([]);
  const load = useCallback(
    () =>
      api(`events/${e.id}/check-ins`)
        .then(setRows)
        .catch((err) => setError(err.message)),
    [e.id],
  );
  useEffect(() => {
    load();
  }, [load]);
  const scanned = useCallback((value: string) => {
    setToken(value);
    setSelected("");
    setCamera(false);
    setMessage("QR read. Review arrival count, then confirm check-in.");
  }, []);
  const actual = rows
    .filter((r) => r.sessionId === sessionId)
    .reduce((n, r) => n + r.count, 0);
  const f = e.analytics.functions.find((s: Data) => s.id === sessionId);
  return (
    <section className="panel">
      <h2>Guest arrival check-in</h2>
      <p>
        Record the total people arriving for a household and function. Repeated
        scans never add extra arrivals. Use a correction with a reason to change
        an existing count.
      </p>
      <Field label="Check-in function">
        <select
          value={sessionId}
          onChange={(v) => setSessionId(v.target.value)}
        >
          {e.sessions.map((s: Data) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </Field>
      <div className="stats">
        <div className="stat">
          Expected estimate
          <strong className="stat-value">{f?.expected || 0}</strong>
        </div>
        <div className="stat">
          Confirmed RSVP
          <strong className="stat-value">{f?.confirmed || 0}</strong>
        </div>
        <div className="stat">
          Actually checked in<strong className="stat-value">{actual}</strong>
        </div>
      </div>
      <Button variant="outline" onClick={() => setCamera(true)}>
        Scan invitation QR
      </Button>
      {camera && (
        <CameraScanner scanned={scanned} close={() => setCamera(false)} />
      )}
      <form
        onSubmit={async (ev) => {
          ev.preventDefault();
          setBusy(true);
          setError("");
          setMessage("");
          try {
            let raw = token.trim();
            if (raw.includes("/")) {
              try {
                raw = new URL(raw).pathname.split("/").pop() || "";
              } catch {
                throw Error("Enter a valid invitation URL or token");
              }
            }
            await api(`events/${e.id}/check-ins`, reason ? "PATCH" : "POST", {
              sessionId,
              ...(selected ? { invitationId: selected } : { token: raw }),
              count,
              ...(reason ? { reason } : {}),
            });
            setMessage(
              reason
                ? "Arrival count corrected and audited."
                : "Household checked in.",
            );
            setReason("");
            await load();
            saved();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Invitation token or URL">
          <input
            value={token}
            onChange={(v) => {
              setToken(v.target.value);
              setSelected("");
            }}
            autoComplete="off"
          />
        </Field>
        <Field label="Search guest or household">
          <input value={search} onChange={(v) => setSearch(v.target.value)} />
        </Field>
        <Field label="Select guest">
          <select
            value={selected}
            onChange={(v) => {
              setSelected(v.target.value);
              setToken("");
            }}
          >
            <option value="">Use token instead</option>
            {e.invitations
              .filter(
                (i: Data) =>
                  !i.revoked &&
                  `${i.name} ${i.household?.name || ""}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((i: Data) => (
                <option value={i.id} key={i.id}>
                  {i.name} · invited {i.invitedSize}
                </option>
              ))}
          </select>
        </Field>
        <div className="fields">
          <Field label="Total people arrived">
            <input
              type="number"
              min={0}
              max={100}
              required
              value={count}
              onChange={(v) => setCount(Number(v.target.value))}
            />
          </Field>
          <Field label="Correction reason (only for existing check-ins)">
            <input
              minLength={3}
              maxLength={300}
              value={reason}
              onChange={(v) => setReason(v.target.value)}
            />
          </Field>
        </div>
        <Button disabled={busy || (!selected && !token)}>
          {reason ? "Correct arrival count" : "Confirm check-in"}
        </Button>
      </form>
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
      <h3>Recorded arrivals</h3>
      {rows
        .filter((r) => r.sessionId === sessionId)
        .map((r) => (
          <p key={r.id}>
            {e.invitations.find((i: Data) => i.id === r.invitationId)?.name} ·{" "}
            {r.count} people · {new Date(r.checkedInAt).toLocaleString("en-IN")}
          </p>
        ))}
    </section>
  );
}
