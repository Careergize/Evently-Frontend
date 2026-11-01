"use client";
import { useState } from "react";
import { api, Field, Modal, type Data } from "./shared";
import { Button } from "./ui/button";
const fields = [
  "name",
  "email",
  "phone",
  "household",
  "invitedSize",
  "category",
  "members",
];
export function GuestImport({
  eventId,
  close,
  saved,
}: {
  eventId: string;
  close: () => void;
  saved: () => void;
}) {
  const [csv, setCsv] = useState("");
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [report, setReport] = useState<Data>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [partial, setPartial] = useState(false);
  async function preview(text = csv, map = mapping) {
    setBusy(true);
    setError("");
    try {
      const r = await api(`events/${eventId}/guests/import`, "POST", {
        csv: text,
        mapping: map,
        preview: true,
      });
      setReport(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Preview guest import" close={close}>
      <p>
        Map your columns, review every row, then confirm. Separate member names
        with semicolons.
      </p>
      <Field label="Guest CSV file">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 500000) {
              setError("Maximum CSV size is 500 KB");
              return;
            }
            const text = await file.text();
            setCsv(text);
            setMapping({});
            await preview(text, {});
          }}
        />
      </Field>
      {report && (
        <>
          <div className="fields">
            {fields.map((field) => (
              <Field label={field} key={field}>
                <select
                  value={
                    mapping[field] ||
                    (report.headers.includes(field) ? field : "")
                  }
                  onChange={(e) => {
                    setMapping({ ...mapping, [field]: e.target.value });
                    setReport({ ...report, stale: true });
                  }}
                >
                  <option value="">Not mapped</option>
                  {report.headers.map((h: string) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
          <Button variant="outline" disabled={busy} onClick={() => preview()}>
            Refresh preview
          </Button>
          <p>
            {report.valid} valid of {report.rows.length} rows ·{" "}
            {report.errors.length} errors
          </p>
          <div className="table-wrap" style={{ maxHeight: 300 }}>
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Contact / household</th>
                  <th>People</th>
                  <th>Validation</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r: Data) => (
                  <tr key={r.row}>
                    <td>{r.row}</td>
                    <td>
                      {r.data?.name} {r.data?.household}
                    </td>
                    <td>{r.data?.invitedSize}</td>
                    <td>{r.error || "Ready"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {report.errors.length > 0 && (
            <label className="check">
              <input
                type="checkbox"
                checked={partial}
                onChange={(e) => setPartial(e.target.checked)}
              />
              Import valid rows only; leave invalid rows unsaved
            </label>
          )}
          <Button
            disabled={
              busy ||
              report.stale ||
              !report.valid ||
              (!!report.errors.length && !partial)
            }
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const result = await api(
                  `events/${eventId}/guests/import`,
                  "POST",
                  { csv, mapping, partial },
                );
                if (result.errors.length) {
                  setReport({ ...report, imported: result.imported });
                  setError(
                    `${result.imported} rows saved. Unimported rows: ${result.errors.map((r: Data) => `Row ${r.row}: ${r.message}`).join("; ")}`,
                  );
                  saved();
                } else {
                  saved();
                  close();
                }
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {report.imported
              ? "Retry remaining rows"
              : `Confirm import of ${report.valid} rows`}
          </Button>
        </>
      )}
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
    </Modal>
  );
}
