import { FileText, LoaderCircle, RefreshCcw, ShieldCheck, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";

export interface ParsedInvoice {
  fileName: string;
  fileSize: string;
  previewUrl: string | null;
  isPDF: boolean;
  extractedData: {
    invoiceNumber: string;
    company: string;
    amount: string;
    dueDate: string;
    currency: string;
  };
}

interface InvoiceUploaderProps {
  onParsed?: (data: ParsedInvoice) => void;
}

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

export function InvoiceUploader({ onParsed }: InvoiceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedInvoice | null>(null);
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleFile = async (nextFile: File) => {
    if (!ACCEPTED.includes(nextFile.type)) {
      window.alert("Please upload a PDF, PNG, or JPG file.");
      return;
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      window.alert("File too large. Max 10MB.");
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setFile(nextFile);
    setParsing(true);
    setParsed(null);

    await new Promise((resolve) => window.setTimeout(resolve, 2200));

    const previewUrl = nextFile.type.startsWith("image/") ? URL.createObjectURL(nextFile) : null;
    previewUrlRef.current = previewUrl;

    const mockData: ParsedInvoice = {
      fileName: nextFile.name,
      fileSize: `${(nextFile.size / 1024).toFixed(1)} KB`,
      previewUrl,
      isPDF: nextFile.type === "application/pdf",
      extractedData: {
        invoiceNumber: `INV-${Math.floor(Math.random() * 9000 + 1000)}`,
        company: nextFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") || "Uploaded Company",
        amount: `$${(Math.random() * 90000 + 10000).toFixed(2)}`,
        dueDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
        currency: "USD",
      },
    };

    setParsed(mockData);
    setParsing(false);
    onParsed?.(mockData);

    window.dispatchEvent(
      new CustomEvent("fintrix:chat-notify", {
        detail: {
          message:
            `Invoice "${nextFile.name}" uploaded and parsed. ` +
            `Detected: ${mockData.extractedData.company}, ` +
            `Amount: ${mockData.extractedData.amount}, ` +
            `Due: ${mockData.extractedData.dueDate}. ` +
            "AI verification is running and a trust score will be assigned shortly.",
          timestamp: new Date().toISOString(),
        },
      }),
    );
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) {
      void handleFile(dropped);
    }
  };

  const reset = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFile(null);
    setParsed(null);
    setParsing(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div style={{ marginTop: "16px" }}>
      {!file ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "#3b82f6" : "#334155"}`,
            borderRadius: "12px",
            padding: "32px 20px",
            textAlign: "center",
            background: isDragging
              ? "linear-gradient(180deg, rgba(2,6,23,0.88) 0%, rgba(15,23,42,1) 100%)"
              : "linear-gradient(180deg, rgba(2,6,23,0.78) 0%, rgba(15,23,42,0.96) 100%)",
            boxShadow: isDragging ? "0 0 0 1px rgba(59,130,246,0.3), 0 0 28px rgba(59,130,246,0.12)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 14px",
              display: "grid",
              placeItems: "center",
              borderRadius: "18px",
              background: "rgba(59,130,246,0.12)",
              color: "#93c5fd",
              boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.16)",
            }}
          >
            <UploadCloud size={28} />
          </div>
          <p style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: "6px", fontSize: "0.95rem" }}>
            Drop your invoice here
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "18px" }}>
            PDF, PNG, JPG. Max 10MB.
          </p>
          <button
            type="button"
            style={{
              padding: "8px 20px",
              background: "rgba(15,23,42,0.9)",
              border: "1px solid #334155",
              borderRadius: "999px",
              color: "#cbd5e1",
              fontSize: "0.8rem",
            }}
          >
            Browse Files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: "none" }}
            onChange={(event) => {
              if (event.target.files?.[0]) {
                void handleFile(event.target.files[0]);
              }
            }}
          />
        </div>
      ) : parsing ? (
        <div
          style={{
            background: "#0f172a",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
            border: "1px solid #1e293b",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 16px",
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              border: "1px solid rgba(59,130,246,0.28)",
              background: "rgba(2,6,23,0.9)",
              color: "#60a5fa",
            }}
          >
            <LoaderCircle size={28} style={{ animation: "fintrixSpin 0.8s linear infinite" }} />
          </div>
          <style>{`@keyframes fintrixSpin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#e2e8f0", fontWeight: 600 }}>AI Parsing Invoice...</p>
          <p style={{ color: "#6b7280", fontSize: "0.78rem", marginTop: "6px" }}>
            Extracting data, running OCR, and checking risk parameters.
          </p>
        </div>
      ) : parsed ? (
        <div
          style={{
            background: "#0f172a",
            borderRadius: "12px",
            border: "1px solid #1e293b",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #1e293b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={18} color="#4ade80" />
              <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.9rem" }}>
                Invoice Parsed Successfully
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "0.8rem",
              }}
            >
              <RefreshCcw size={14} />
              Upload different file
            </button>
          </div>

          <div style={{ padding: "20px" }}>
            <div
              style={{
                background: "#020617",
                borderRadius: "8px",
                padding: "20px",
                border: "1px solid #0f172a",
                fontFamily: "monospace",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "16px",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #1e293b",
                }}
              >
                <div>
                  <p style={{ color: "#3b82f6", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "4px" }}>
                    INVOICE FROM
                  </p>
                  <p style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 600 }}>
                    {parsed.extractedData.company}
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "0.72rem" }}>{parsed.fileName}</p>
                </div>
                <div>
                  <p style={{ color: "#3b82f6", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "4px" }}>
                    INVOICE TO
                  </p>
                  <p style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 600 }}>
                    Fintrix Platform
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "0.72rem" }}>Financing Request</p>
                </div>
                <div>
                  <p style={{ color: "#3b82f6", fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "4px" }}>
                    PAYMENT DETAILS
                  </p>
                  <p style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 600 }}>
                    {parsed.extractedData.invoiceNumber}
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "0.72rem" }}>Due: {parsed.extractedData.dueDate}</p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <p style={{ color: "#6b7280", fontSize: "0.7rem" }}>DESCRIPTION</p>
                  <p style={{ color: "#e2e8f0", fontSize: "0.82rem", marginTop: "4px" }}>
                    Invoice Financing Request
                  </p>
                </div>
                <div>
                  <p style={{ color: "#6b7280", fontSize: "0.7rem" }}>FILE SIZE</p>
                  <p style={{ color: "#e2e8f0", fontSize: "0.82rem", marginTop: "4px" }}>{parsed.fileSize}</p>
                </div>
                <div>
                  <p style={{ color: "#6b7280", fontSize: "0.7rem" }}>AMOUNT</p>
                  <p style={{ color: "#4ade80", fontSize: "1rem", fontWeight: 700, marginTop: "4px" }}>
                    {parsed.extractedData.amount}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "#0f172a",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {["OCR Complete", "Structure Valid", "Risk Assessed"].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        color: "#4ade80",
                        fontSize: "0.7rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <ShieldCheck size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
                <span
                  style={{
                    background: "#052e16",
                    color: "#4ade80",
                    padding: "3px 12px",
                    borderRadius: "999px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  READY FOR MARKETPLACE
                </span>
              </div>
            </div>

            {parsed.previewUrl && (
              <div
                style={{
                  marginTop: "12px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #1e293b",
                  maxHeight: "220px",
                  background: "#020617",
                }}
              >
                <img
                  src={parsed.previewUrl}
                  alt="Invoice preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            {parsed.isPDF && (
              <div
                style={{
                  marginTop: "12px",
                  borderRadius: "8px",
                  border: "1px solid #1e293b",
                  background: "#020617",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  color: "#94a3b8",
                  fontSize: "0.78rem",
                }}
              >
                <FileText size={16} />
                PDF uploaded: {parsed.fileName}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
