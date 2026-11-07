
import { useEffect, useRef, useState } from "react";
import {
  Send,
  Bot,
  User,
  FileText,
  Loader2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

import { askQuestion, getDocuments } from "../services/api";

function Chat() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getDocuments();
        setDocuments(data.filter((doc) => doc.status === "completed"));
      } catch (err) {
        setError(
          err.response?.data?.detail || "Failed to load documents."
        );
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((previous) => [...previous, userMessage]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await askQuestion(
        trimmedQuestion,
        selectedDocument || null
      );

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        sources: response.sources || [],
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to generate an answer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">
          Chat with Documents
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ask questions and get AI-powered answers from your PDFs.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-medium text-slate-700">
          Select document
        </label>

        <select
          value={selectedDocument}
          onChange={(event) => setSelectedDocument(event.target.value)}
          disabled={documentsLoading || loading}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 sm:max-w-xs"
        >
          <option value="">All documents</option>

          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.filename}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 p-4">
          <div className="rounded-lg bg-blue-100 p-2">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              DocuMind AI
            </h2>
            <p className="text-xs text-slate-500">
              Document-powered AI assistant
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl bg-blue-100 p-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>

              <h3 className="font-semibold text-slate-800">
                Start a conversation
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Ask a question about your uploaded documents.
                I'll retrieve relevant passages and generate an answer.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="h-9 w-9 shrink-0 rounded-full bg-blue-100 p-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-4 text-sm leading-7 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.sources?.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="mb-2 text-xs font-semibold text-slate-500">
                      SOURCES
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, index) => (
                        <div
                          key={`${source.chunk_id}-${index}`}
                          className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                        >
                          <FileText className="h-3 w-3" />
                          {source.source} · Page {source.page_number}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200 p-2">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                Generating answer...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="flex items-center gap-2 border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border-t border-slate-200 bg-white p-4"
        >
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask something about your documents..."
            disabled={loading}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
