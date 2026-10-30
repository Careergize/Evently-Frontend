"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { api, Field, Art, type Data } from "./shared";
import { Button } from "./ui/button";
const defaults = {
  title: "",
  type: "Wedding",
  host: "",
  description: "",
  startsAt: "",
  endsAt: "",
  timezone: "Asia/Kolkata",
  venue: "",
  address: "",
  mapsUrl: "",
  coverImage: "",
  template: "Botanical",
  theme: "emerald",
  message: "With full hearts, we invite you to celebrate with us.",
  status: "DRAFT",
  settings: {
    rsvpEnabled: true,
    deadline: "",
    allowMaybe: true,
    allowPartySize: true,
    maxPartySize: 10,
    mealsEnabled: true,
    messagesEnabled: true,
    confirmedProbability: 1,
    maybeProbability: 0.5,
    pendingProbability: 0.3,
    adjustment: 0,
    contingency: 10,
  },
};
function localDate(v: string, tz: string) {
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
export function zonedUTC(value: string, tz: string) {
  if (!value) return null;
  const [date, time] = value.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const desired = Date.UTC(y, m - 1, d, h, min);
  let instant = desired;
  for (let i = 0; i < 3; i++) {
    const rendered = localDate(new Date(instant).toISOString(), tz);
    const offset = new Date(rendered + "Z").getTime() - instant;
    instant = desired - offset;
  }
  if (localDate(new Date(instant).toISOString(), tz) !== value)
    throw Error("This local time does not exist in the selected time zone");
  return new Date(instant).toISOString();
}
export function EventWizard({ id }: { id?: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<Data>(defaults);
  const [eventId, setEventId] = useState(id);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState("");
  useEffect(() => {
    if (id)
      api(`events/${id}`)
        .then((e) =>
          setEvent({
            ...e,
            startsAt: localDate(e.startsAt, e.timezone),
            endsAt: e.endsAt ? localDate(e.endsAt, e.timezone) : "",
            settings: {
              ...e.settings,
              deadline: e.settings.deadline
                ? localDate(e.settings.deadline, e.timezone)
                : "",
            },
          }),
        )
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [id]);
  const update = (key: string, v: Data) =>
    setEvent((e: Data) => ({ ...e, [key]: v }));
  const setting = (key: string, v: Data) =>
    setEvent((e: Data) => ({ ...e, settings: { ...e.settings, [key]: v } }));
  async function save(publish = false, leave = false) {
    setBusy(true);
    setError("");
    try {
      if (!event.title || !event.host || !event.startsAt)
        throw Error(
          "Add a title, host name and start date before saving your draft.",
        );
      const payload = {
        ...event,
        status: publish ? "PUBLISHED" : event.status,
        startsAt: zonedUTC(event.startsAt, event.timezone),
        endsAt: zonedUTC(event.endsAt, event.timezone),
        settings: {
          ...event.settings,
          deadline: zonedUTC(event.settings.deadline, event.timezone),
        },
      };
      if (payload.endsAt && payload.endsAt < payload.startsAt!)
        throw Error("End time must follow the start time");
      const e = await api(
        eventId ? `events/${eventId}` : "events",
        eventId ? "PATCH" : "POST",
        payload,
      );
      setEventId(e.id);
      toast.success(
        publish ? "Your invitation is ready to share" : "Draft saved",
      );
      if (publish || leave) router.push(`/dashboard/events/${e.id}`);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  const input = (key: string, type = "text", required = false) => (
    <input
      type={type}
      required={required}
      value={event[key] || ""}
      onChange={(e) => update(key, e.target.value)}
    />
  );
  if (loading) return <div className="loading" />;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">A NEW OCCASION</span>
          <h1 style={{ marginTop: 8 }}>
            {id ? "Make it yours." : "Let’s bring your people together."}
          </h1>
          <p>Five simple steps to a beautiful celebration.</p>
        </div>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => save(false, true)}
        >
          <Save size={14} />
          Save draft
        </Button>
      </div>
      <div className="wizard-steps">
        {[
          "The occasion",
          "When & where",
          "Your invitation",
          "RSVP details",
          "Review & publish",
        ].map((s, i) => (
          <button
            type="button"
            key={s}
            className={`wizard-step ${step === i ? "active" : ""}`}
            style={{ border: 0, background: "none" }}
            onClick={() => setStep(i)}
          >
            <span>{step > i ? <Check size={13} /> : i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      <form
        className="panel"
        style={{ maxWidth: 1000 }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (step === 4) await save(true);
          else if (step === 1) {
            if (await save()) setStep(step + 1);
          } else setStep(step + 1);
        }}
      >
        {step === 0 ? (
          <>
            <h2>Every celebration has a story.</h2>
            <p className="muted" style={{ fontSize: 12, marginBottom: 25 }}>
              Start with the people and the occasion.
            </p>
            <div className="fields">
              <Field label="Event title">{input("title", "text", true)}</Field>
              <Field label="Event type">
                <select
                  value={event.type}
                  onChange={(e) => update("type", e.target.value)}
                >
                  {[
                    "Wedding",
                    "Reception",
                    "Engagement",
                    "Birthday",
                    "Anniversary",
                    "Housewarming",
                    "Family gathering",
                    "Corporate event",
                    "Custom",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Host or family name">
              {input("host", "text", true)}
            </Field>
            <Field label="A little about the occasion">
              <textarea
                value={event.description}
                onChange={(e) => update("description", e.target.value)}
                maxLength={3000}
              />
            </Field>
          </>
        ) : step === 1 ? (
          <>
            <h2>A time and a place to remember.</h2>
            <div className="fields">
              <Field label="Start date & time">
                {input("startsAt", "datetime-local", true)}
              </Field>
              <Field label="End date & time (optional)">
                {input("endsAt", "datetime-local")}
              </Field>
              <Field label="Event time zone">
                <select
                  value={event.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                >
                  {[
                    "Asia/Kolkata",
                    "Asia/Dubai",
                    "Asia/Singapore",
                    "Europe/London",
                    "America/New_York",
                    "America/Los_Angeles",
                    "Australia/Sydney",
                    "UTC",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Venue name">{input("venue")}</Field>
            </div>
            <Field label="Venue address">{input("address")}</Field>
            <Field label="Google Maps link (optional)">
              {input("mapsUrl", "url")}
            </Field>
          </>
        ) : step === 2 ? (
          <>
            <h2>A first glimpse of your celebration.</h2>
            <p className="muted">Choose a design, then add your own touch.</p>
            <div className="template-grid">
              {["Botanical", "Royal", "Minimal"].map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`template-choice ${event.template === t ? "selected" : ""}`}
                  onClick={() => update("template", t)}
                >
                  <Art
                    event={{
                      ...event,
                      template: t,
                      startsAt: event.startsAt || new Date().toISOString(),
                    }}
                  />
                  <p>
                    {t} {event.template === t ? "✓" : ""}
                  </p>
                </button>
              ))}
            </div>
            <div className="fields" style={{ marginTop: 25 }}>
              <Field label="Colour theme">
                <select
                  value={event.theme}
                  onChange={(e) => update("theme", e.target.value)}
                >
                  <option value="emerald">Deep emerald</option>
                  <option value="gold">Muted gold</option>
                  <option value="rose">Dusty rose</option>
                </select>
              </Field>
              <Field
                label="Cover image (optional)"
                hint="PNG, JPEG or WebP. Maximum 500 KB. Stored with your event."
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (
                      f.size > 500000 ||
                      !["image/png", "image/jpeg", "image/webp"].includes(
                        f.type,
                      )
                    ) {
                      toast.error("Choose a PNG, JPEG or WebP under 500 KB");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => update("coverImage", reader.result);
                    reader.readAsDataURL(f);
                  }}
                />
              </Field>
            </div>
            {event.coverImage && (
              <Button
                variant="ghost"
                type="button"
                onClick={() => update("coverImage", "")}
              >
                Remove cover image
              </Button>
            )}
            <Field label="Your invitation message">
              <textarea
                value={event.message}
                onChange={(e) => update("message", e.target.value)}
                maxLength={3000}
              />
            </Field>
          </>
        ) : step === 3 ? (
          <>
            <h2>Make replying effortless.</h2>
            {[
              ["rsvpEnabled", "Accept RSVP responses"],
              ["allowMaybe", "Allow “Maybe” responses"],
              ["allowPartySize", "Let guests specify their party size"],
              ["mealsEnabled", "Ask for meal preference"],
              ["messagesEnabled", "Allow a personal message"],
            ].map(([k, t]) => (
              <label className="check" key={k}>
                <input
                  type="checkbox"
                  checked={event.settings[k]}
                  onChange={(e) => setting(k, e.target.checked)}
                />
                {t}
              </label>
            ))}
            <div className="fields">
              <Field label="RSVP deadline (optional)">
                <input
                  type="datetime-local"
                  value={event.settings.deadline}
                  onChange={(e) => setting("deadline", e.target.value)}
                />
              </Field>
              <Field label="Maximum party size">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={event.settings.maxPartySize}
                  onChange={(e) =>
                    setting("maxPartySize", Number(e.target.value))
                  }
                />
              </Field>
            </div>
            <p className="notice">
              For tracked invitations, the guest’s invited party size is also a
              limit. Deadlines follow your event’s selected time zone.
            </p>
          </>
        ) : (
          <>
            <h2>Ready for your people?</h2>
            <div className="two-col">
              <Art
                event={{
                  ...event,
                  startsAt: event.startsAt || new Date().toISOString(),
                }}
              />
              <div>
                <h2>{event.title || "Your celebration"}</h2>
                <p>{event.host}</p>
                <p className="muted">
                  {event.startsAt?.replace("T", " · ")}
                  <br />
                  {event.timezone}
                  <br />
                  {event.venue}
                  <br />
                  {event.address}
                </p>
                <p>{event.message}</p>
                <span className="badge">
                  {event.settings.rsvpEnabled ? "RSVP enabled" : "RSVP closed"}
                </span>
              </div>
            </div>
            <p className="notice">
              Publishing makes your invitation accessible to anyone with its
              link. Guest contact details remain private. You can edit details
              and close responses later.
            </p>
          </>
        )}
        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              step ? setStep(step - 1) : router.push("/dashboard")
            }
          >
            <ArrowLeft size={14} />
            {step ? "Back" : "Cancel"}
          </Button>
          <Button disabled={busy}>
            {busy ? "Saving…" : step === 4 ? "Publish event" : "Continue"}
            {step === 4 ? <Check size={14} /> : <ArrowRight size={14} />}
          </Button>
        </div>
      </form>
    </>
  );
}
