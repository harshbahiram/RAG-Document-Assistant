
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  RefreshCw,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Files,
  Search,
  FileUp,
  X,
  ArrowUpRight,
} from "lucide-react";

import {
  getDocuments,
  uploadDocument,
  processDocument,
  deleteDocument,
} from "../services/api";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const fetchDocuments = async (showLoader = false) => {
    try {
      setError("");

      if (showLoader) setRefreshing(true);

      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load documents.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const uploaded = await uploadDocument(file);
      await processDocument(uploaded.id);

      await fetchDocuments();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Document upload or processing failed."
      );
      await fetchDocuments();
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    handleUpload(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (uploading) return;

    const file = event.dataTransfer.files?.[0];
    handleUpload(file);
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setError("");
      await deleteDocument(documentId);
      await fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete document.");
    }
  };

  const totalDocuments = documents.length;
  const completedDocuments = documents.filter(
    (doc) => doc.status === "completed"
  ).length;
  const processingDocuments = documents.filter(
    (doc) => doc.status === "processing"
  ).length;
  const failedDocuments = documents.filter(
    (doc) => doc.status === "failed"
  ).length;

  const filteredDocuments = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(search.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    return bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusConfig = {
    completed: {
      label: "Completed",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      dot: "bg-emerald-500",
    },
    processing: {
      label: "Processing",
      className: "bg-amber-50 text-amber-700 ring-amber-600/20",
      dot: "bg-amber-500",
    },
    failed: {
      label: "Failed",
      className: "bg-red-50 text-red-700 ring-red-600/20",
      dot: "bg-red-500",
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-10">

    {/* Dashboard Header */}
    <section className="p-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
          <span className="text-xs font-semibold tracking-wide text-indigo-700">
            YOUR WORKSPACE
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Dashboard.  
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Manage your documents, organize your files, and get insights with AI.
        </p>
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? "Processing document..." : "Upload document"}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        disabled={uploading}
        onChange={handleFileChange}
      />
    </section>
      
    {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            onClick={() => setError("")}
            className="rounded-md p-1 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="p-8 pt-0 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total documents"
          value={totalDocuments}
          icon={Files}
          iconClass="bg-indigo-50 text-indigo-600"
          description="Documents in your workspace"
        />

        <StatCard
          title="Completed"
          value={completedDocuments}
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
          description="Ready for AI conversations"
        />

        <StatCard
          title="Processing"
          value={processingDocuments}
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-600"
          description="Currently being processed"
        />

        <StatCard
          title="Failed"
          value={failedDocuments}
          icon={AlertCircle}
          iconClass="bg-red-50 text-red-600"
          description="Documents needing attention"
        />
      </section>

      {/* Upload Area */}
      <section
        onDragOver={(event) => {
          event.preventDefault();
          if (!uploading) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-10 ${
          isDragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:scale-105">
          {uploading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <FileUp className="h-7 w-7" />
          )}
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-900">
          {uploading ? "Processing your document..." : "Drop your PDF here"}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Or{" "}
          <span className="font-semibold text-indigo-600">
            browse files
          </span>{" "}
          from your computer
        </p>

        <p className="mt-3 text-xs text-slate-400">
          PDF files only · Maximum size 20 MB
        </p>
      </section>

      {/* Documents */}
      <section className="p-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your documents
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage your uploaded PDF files.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search documents..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:w-56"
              />
            </div>

            <button
              onClick={() => fetchDocuments(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              title="Refresh documents"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Document count */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Document library
          </span>
          <span className="text-xs font-medium text-slate-500">
            {filteredDocuments.length} of {totalDocuments} documents
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              {search ? (
                <Search className="h-7 w-7 text-slate-400" />
              ) : (
                <FileText className="h-7 w-7 text-slate-400" />
              )}
            </div>

            <h3 className="mt-5 font-semibold text-slate-900">
              {search ? "No matching documents" : "Your library is empty"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {search
                ? "Try searching with a different document name."
                : "Upload your first PDF document to start asking questions and exploring it with AI."}
            </p>

            {!search && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Upload your first PDF
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDocuments.map((document) => {
              const status =
                statusConfig[document.status] || {
                  label: document.status,
                  className: "bg-slate-100 text-slate-600 ring-slate-500/20",
                  dot: "bg-slate-400",
                };

              return (
                <div
                  key={document.id}
                  className="group flex flex-col justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FileText className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <h3
                        className="truncate text-sm font-semibold text-slate-800"
                        title={document.filename}
                      >
                        {document.filename}
                      </h3>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>{formatFileSize(document.file_size)}</span>
                        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                        <span>{formatDate(document.created_at)}</span>
                        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                        <span>PDF document</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${status.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>

                    <button
                      onClick={() => handleDelete(document.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete document"
                      aria-label={`Delete ${document.filename}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <ArrowUpRight className="hidden h-4 w-4 text-slate-300 transition group-hover:text-indigo-500 sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && documents.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:px-6">
            <p className="text-xs text-slate-400">
              Your documents are stored securely in your workspace.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, iconClass, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

export default Dashboard;
