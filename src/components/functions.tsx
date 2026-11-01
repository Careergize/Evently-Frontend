"use client";
import { useState } from "react";
import { toast } from "sonner";
import { api, Field, Modal, fmtDate, download, type Data } from "./shared";
import { zonedUTC } from "./wizard";
import { Button } from "./ui/button";
function local(v: string, tz: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(v))
    .replace(" ", "T");
}
export function Functions({
  event: e,
  saved,
}: {
  event: Data;
  saved: () => void;
}) {
  const [form, setForm] = useState<Data>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const edit = (s: Data) => {
    setError("");
    setForm({
      ...s,
      startsAt: local(s.startsAt, e.timezone),
      deadline: s.deadline ? local(s.deadline, e.timezone) : "",
    });
  };
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Your functions</h2>
          <p>
            {e.analytics.confirmed} confirmed people across invitations ·{" "}
            {e.analytics.functions.reduce(
              (n: number, s: Data) => n + s.confirmed,
              0,
            )}{" "}
            total function attendances
          </p>
        </div>
        <Button
          onClick={() =>
            edit({
              title: "",
              startsAt: e.startsAt,
              venue: e.venue,
              mapsUrl: e.mapsUrl,
              rsvpEnabled: true,
              mealsEnabled: true,
            })
          }
        >
          Add function
        </Button>
      </div>
      <p className="notice">
        People are counted once per invitation in the overview. Function
        attendances count each visit separately. Household party sizes do not
        establish named individual attendance across functions.
      </p>
      {e.sessions.map((s: Data) => {
        const a = e.analytics.functions.find((v: Data) => v.id === s.id);
        return (
          <div className="function-card" key={s.id}>
            <div className="panel-heading">
              <div>
                <h3>{s.title}</h3>
                <p>
                  {fmtDate(s.startsAt, e.timezone)} ·{" "}
                  {new Date(s.startsAt).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: e.timezone,
                  })}{" "}
                  · {s.venue || "Venue to be decided"}
                </p>
                <p>
                  {a.confirmed} confirmed · {a.actual} actually checked in ·{" "}
                  {a.maybe} maybe · {a.pending} pending invited people
                </p>
                <small>
                  {s.rsvpEnabled ? "Accepting responses" : "Responses closed"}
                  {s.deadline
                    ? ` · Deadline ${fmtDate(s.deadline, e.timezone)}`
                    : ""}
                </small>
              </div>
              <Button variant="outline" onClick={() => edit(s)}>
                Edit function
              </Button>
            </div>
          </div>
        );
      })}
      <Button
        variant="outline"
        onClick={() =>
          download(
            `${e.title.replace(/[^a-z0-9]/gi, "-")}-attendance-${new Date().toISOString().slice(0, 10)}.csv`,
            [
              [
                "Event",
                "Exported at",
                "Function",
                "Confirmed",
                "Maybe",
                "Pending tracked people",
                "Actual checked in",
              ],
              ...e.analytics.functions.map((s: Data) => [
                e.title,
                new Date().toISOString(),
                s.title,
                s.confirmed,
                s.maybe,
                s.pending,
                s.actual,
              ]),
            ],
          )
        }
      >
        Export attendance summary
      </Button>
      {form && (
        <Modal
          title={form.id ? "Edit function" : "Add function"}
          close={() => setForm(null)}
        >
          <form
            onSubmit={async (ev) => {
              ev.preventDefault();
              setBusy(true);
              setError("");
              try {
                await api(
                  `events/${e.id}/sessions${form.id ? `/${form.id}` : ""}`,
                  form.id ? "PATCH" : "POST",
                  {
                    ...form,
                    startsAt: zonedUTC(form.startsAt, e.timezone),
                    deadline: zonedUTC(form.deadline, e.timezone),
                  },
                );
                setForm(null);
                saved();
                toast.success("Function saved; existing responses retained");
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {[
              ["title", "Function name", "text"],
              ["startsAt", `Date and time (${e.timezone})`, "datetime-local"],
              ["venue", "Function venue", "text"],
              ["mapsUrl", "Location link", "url"],
              ["deadline", "Function RSVP deadline", "datetime-local"],
            ].map(([k, l, t]) => (
              <Field key={k} label={l}>
                <input
                  required={k === "title" || k === "startsAt"}
                  type={t}
                  value={form[k] || ""}
                  onChange={(v) => setForm({ ...form, [k]: v.target.value })}
                />
              </Field>
            ))}
            {[
              ["rsvpEnabled", "Accept function responses"],
              ["mealsEnabled", "Collect meal preference"],
            ].map(([k, l]) => (
              <label className="check" key={k}>
                <input
                  type="checkbox"
                  checked={form[k]}
                  onChange={(v) => setForm({ ...form, [k]: v.target.checked })}
                />
                {l}
              </label>
            ))}
            {error && (
              <p className="error-box" role="alert">
                {error}
              </p>
            )}
            <Button disabled={busy}>Save function</Button>
          </form>
        </Modal>
      )}
    </section>
  );
}
