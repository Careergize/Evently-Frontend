"use client";
import { useState, useEffect, useCallback } from "react";
import { api, Field, Modal, type Data } from "./shared";
import { Button } from "./ui/button";
export function Households({
  eventId,
  saved,
  sessions,
}: {
  eventId: string;
  saved: () => void;
  sessions: Data[];
}) {
  const [rows, setRows] = useState<Data[]>([]);
  const [form, setForm] = useState<Data>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      api(`events/${eventId}/households`)
        .then(setRows)
        .catch((e) => setError(e.message)),
    [eventId],
  );
  useEffect(() => {
    load();
  }, [load]);
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Household groups</h2>
        <Button onClick={() => setForm({ name: "" })}>Create household</Button>
      </div>
      <p>
        Group related invitations without changing their private links or
        responses. Removing a group keeps its guests. Merge preserves each
        invitation and its RSVP.
      </p>
      {rows.map((h) => (
        <div className="function-card" key={h.id}>
          <h3>{h.name}</h3>
          <p>
            {h.invitations.length} invitations ·{" "}
            {h.invitations.reduce((n: number, i: Data) => n + i.invitedSize, 0)}{" "}
            invited people
          </p>
          <p>
            {h.invitations.reduce(
              (n: number, i: Data) =>
                n + (i.rsvp?.status === "YES" ? i.rsvp.partySize : 0),
              0,
            )}{" "}
            confirmed people ·{" "}
            {h.invitations.filter((i: Data) => !i.rsvp).length} invitations
            awaiting response
          </p>
          {sessions.map((session) => (
            <p key={session.id}>
              {session.title}:{" "}
              {h.invitations.reduce(
                (n: number, i: Data) =>
                  n +
                  (i.rsvp?.status === "YES"
                    ? i.rsvp.selections?.find(
                        (v: Data) => v.sessionId === session.id,
                      )?.attendees || 0
                    : 0),
                0,
              )}{" "}
              confirmed
            </p>
          ))}
          {h.invitations.map((i: Data) => (
            <small key={i.id} style={{ display: "block" }}>
              {i.name} · {i.rsvp?.status || "Awaiting response"} ·{" "}
              {(i.members || []).join(", ")}
            </small>
          ))}
          <Button variant="outline" onClick={() => setForm(h)}>
            Edit household
          </Button>
        </div>
      ))}
      {!rows.length && (
        <p className="muted">
          Create a household, then assign guests in their editor.
        </p>
      )}
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
      {form && (
        <Modal title="Manage household" close={() => setForm(null)}>
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              setBusy(true);
              setError("");
              try {
                await api(
                  `events/${eventId}/households${form.id ? `/${form.id}` : ""}`,
                  form.id ? "PATCH" : "POST",
                  { name: form.name },
                );
                setForm(null);
                await load();
                saved();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Household name">
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Button disabled={busy}>Save household</Button>
          </form>
          {form.id && (
            <>
              <hr />
              <Field label="Merge into household">
                <select
                  value={form.targetId || ""}
                  onChange={(e) =>
                    setForm({ ...form, targetId: e.target.value })
                  }
                >
                  <option value="">Choose destination</option>
                  {rows
                    .filter((h) => h.id !== form.id)
                    .map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                </select>
              </Field>
              <p>
                Confirming merges this group into the destination and retains
                every invitation.
              </p>
              <Button
                disabled={busy || !form.targetId}
                variant="outline"
                onClick={async () => {
                  setBusy(true);
                  try {
                    await api(
                      `events/${eventId}/households/${form.id}/merge`,
                      "POST",
                      { targetId: form.targetId },
                    );
                    setForm(null);
                    await load();
                    saved();
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Confirm merge
              </Button>
              <Button
                disabled={busy}
                variant="destructive"
                onClick={async () => {
                  setBusy(true);
                  try {
                    await api(
                      `events/${eventId}/households/${form.id}`,
                      "DELETE",
                    );
                    setForm(null);
                    await load();
                    saved();
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Remove group, keep guests
              </Button>
            </>
          )}
          {error && (
            <p role="alert" className="error-box">
              {error}
            </p>
          )}
        </Modal>
      )}
    </section>
  );
}
