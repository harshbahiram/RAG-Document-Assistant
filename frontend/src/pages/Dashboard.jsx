import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  RefreshCw,
  Trash2,
  Loader2,
  AlertCircle,
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    try {
      setError("");
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
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
        err.response?.data?.detail || "Document upload or processing failed."
      );
      await fetchDocuments();
    } finally {
      setUploading(false);
    }
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

  const statusStyle = {
    completed: "bg-green-100 text-green-700",
    processing: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Document Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload and manage your PDF documents.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Processing..." : "Upload PDF"}

          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="font-semibold text-gray-900">Your Documents</h2>
            <p className="text-sm text-gray-500">
              {documents.length} documents uploaded
            </p>
          </div>

          <button
            onClick={fetchDocuments}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            title="Refresh documents"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-gray-300" />
            <h3 className="font-medium text-gray-800">
              No documents uploaded
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload your first PDF to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {document.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(document.file_size / 1024 / 1024).toFixed(2)} MB
                      {" · "}
                      {new Date(document.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyle[document.status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {document.status}
                  </span>

                  <button
                    onClick={() => handleDelete(document.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;