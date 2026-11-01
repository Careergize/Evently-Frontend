"use client";
import { useMemo, useState } from "react";
import qrcode from "qrcode-generator";
import { Button } from "./ui/button";
export function InvitationShare({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [error, setError] = useState("");
  const qr = useMemo(() => {
    if (!url.startsWith("http")) return "";
    const code = qrcode(0, "M");
    code.addData(url);
    code.make();
    return code.createDataURL(4, 16);
  }, [url]);
  return (
    <div className="invitation-share">
      <div className="toolbar">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            setError("");
            try {
              if (navigator.share) await navigator.share({ title, url });
              else {
                await navigator.clipboard.writeText(url);
              }
            } catch (e) {
              if ((e as Error).name !== "AbortError")
                setError(
                  "Sharing is unavailable. Copy the invitation link manually.",
                );
            }
          }}
        >
          Share invitation
        </Button>
        {qr && (
          <Button variant="outline" size="sm" asChild>
            <a download="invitation-qr.gif" href={qr}>
              Download QR code
            </a>
          </Button>
        )}
      </div>
      {qr && (
        <img
          src={qr}
          alt={`QR code for ${title} invitation`}
          width={180}
          height={180}
          style={{
            maxWidth: "100%",
            height: "auto",
            imageRendering: "pixelated",
          }}
        />
      )}
      <p className="muted">
        Anyone with this invitation QR or link can access it. Sharing does not
        confirm delivery.
      </p>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
