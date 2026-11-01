"use client";
import { useState, type ReactNode } from "react";
import { type Data, fmtDate } from "./shared";
import { Button } from "./ui/button";
export const templates = [
  ["Kerala", "Traditional Kerala wedding"],
  ["Modern", "Elegant modern wedding"],
  ["Minimal", "Minimal luxury"],
  ["Floral", "Floral celebration"],
  ["Birthday", "Birthday celebration"],
  ["Family", "General family event"],
];
const motifs: Record<string, string> = {
  Kerala: "✦",
  Modern: "◯",
  Minimal: "✧",
  Floral: "❦",
  Birthday: "✷",
  Family: "⌂",
  Botanical: "❧",
  Royal: "✦",
};
export function InvitationDesign({
  event: e,
  children,
}: {
  event: Data;
  children?: ReactNode;
}) {
  return (
    <article
      className={`invitation-paper design-${(e.template || "Botanical").toLowerCase()} theme-${e.theme || "emerald"} font-${e.font || "serif"}`}
    >
      {e.coverImage ? (
        <img className="cover" src={e.coverImage} alt="Celebration cover" />
      ) : (
        <div className="ornament" aria-hidden="true">
          {motifs[e.template] || "❧"}
        </div>
      )}
      <span className="eyebrow">{e.host || "Your family"}</span>
      <p className="invitation-kicker">
        {e.template === "Birthday"
          ? "ANOTHER YEAR OF WONDER"
          : e.template === "Family"
            ? "GOOD TIMES, TOGETHER"
            : "WITH OUR FAMILIES, WE INVITE YOU"}
      </p>
      <h1>{e.title || "Your celebration"}</h1>
      <p className="invitation-message">{e.message}</p>
      <div className="date">
        {e.startsAt ? fmtDate(e.startsAt, e.timezone) : "Date to be announced"}
        <br />
        {e.startsAt &&
          new Date(e.startsAt).toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: e.timezone,
          })}
        <br />
        <small>{e.timezone}</small>
      </div>
      <h3>{e.venue}</h3>
      <p className="muted">{e.address}</p>
      {e.mapsUrl && (
        <Button variant="outline" size="sm" asChild>
          <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer">
            Venue directions →
          </a>
        </Button>
      )}
      <p className="invitation-message">{e.description}</p>
      {children}
    </article>
  );
}
export function DesignPreview({ event }: { event: Data }) {
  const [mobile, setMobile] = useState(true);
  return (
    <section className="design-preview">
      <div className="toolbar">
        <Button
          type="button"
          variant="outline"
          aria-pressed={mobile}
          onClick={() => setMobile(true)}
        >
          Mobile preview
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-pressed={!mobile}
          onClick={() => setMobile(false)}
        >
          Desktop preview
        </Button>
        <Button type="button" variant="ghost" onClick={() => window.print()}>
          Print / save PDF
        </Button>
      </div>
      <div className={`preview-stage ${mobile ? "preview-mobile" : ""}`}>
        <InvitationDesign event={event} />
        <p className="muted" style={{ textAlign: "center" }}>
          {event.rsvpLabel || "Send my RSVP"}
        </p>
      </div>
    </section>
  );
}
