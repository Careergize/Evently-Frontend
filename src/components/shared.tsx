"use client";
import React from "react";
import { X } from "lucide-react";
export type Data = any;
export async function api(path: string, method = "GET", body?: unknown) {
  const r = await fetch(`/api/${path}`, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const result = await r.json();
  if (!r.ok) {
    const e = new Error(
      result.error?.message ||
        result.data?.errors
          ?.map((x: Data) => `Row ${x.row}: ${x.message}`)
          .join("\n") ||
        "Request failed",
    );
    throw e;
  }
  return result.data;
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const id = React.useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            id,
            "aria-describedby": hint ? id + "-hint" : undefined,
          })
        : children}
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}
export const fmtDate = (v: string, tz = "Asia/Kolkata") =>
  new Date(v).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: tz,
  });
export const money = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
export function download(name: string, rows: Data[][]) {
  const escape = (v: Data) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const url = URL.createObjectURL(
    new Blob([rows.map((r) => r.map(escape).join(",")).join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={close}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
          if (e.key === "Tab") {
            const items = e.currentTarget.querySelectorAll<HTMLElement>(
              "button,input,select,textarea,a[href]",
            );
            const first = items[0],
              last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="modal-title">
          <h2>{title}</h2>
          <button autoFocus aria-label="Close" onClick={close}>
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function Art({ event }: { event: Data }) {
  return (
    <div
      className={`event-art ${event.template === "Royal" ? "royal" : event.theme === "rose" ? "rose" : ""}`}
      style={
        event.coverImage
          ? {
              backgroundImage: `linear-gradient(#153a2840,#153a2840),url(${event.coverImage})`,
              backgroundSize: "cover",
              color: "white",
            }
          : {}
      }
    >
      <small>
        {event.type === "Wedding"
          ? "TOGETHER WITH OUR FAMILIES"
          : event.type?.toUpperCase()}
      </small>
      <strong>{event.title}</strong>
      <span style={{ fontSize: 10, marginTop: 17 }}>
        —{" "}
        {new Date(event.startsAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          timeZone: event.timezone,
        })}{" "}
        —
      </span>
    </div>
  );
}
export function Stat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
}) {
  return (
    <div className="stat">
      <div className="stat-top">
        {label}
        <span className="stat-icon">
          <Icon strokeWidth={1.5} />
        </span>
      </div>
      <strong className="stat-value">
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </strong>
      <small>{sub}</small>
    </div>
  );
}
