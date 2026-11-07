
import { useEffect, useRef, useState } from "react";
import {
  Send,
  Bot,
  User,
  FileText,
  AlertCircle,
  MessageSquare,
  Trash2,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { askQuestion, getDocuments } from "../services/api";

function Chat() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [error, setError] = useState("");
  const [failedQuestion, setFailedQuestion] = useState(null);

  const messagesEndRef = useRef(null);

  // Fetch completed documents
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

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Send question to backend
  const sendQuestion = async (questionText, documentId) => {
    if (loading || !questionText.trim()) return;

    setLoading(true);
    setError("");
    setFailedQuestion(null);

    try {
      const response = await askQuestion(questionText, documentId);

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        sources: response.sources || [],
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to generate an answer. Please try again."
      );

      setFailedQuestion({
        question: questionText,
        documentId,
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit a new question
  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setQuestion("");

    await sendQuestion(
      trimmedQuestion,
      selectedDocument || null
    );
  };

  // Retry failed question
  const handleRetry = async () => {
    if (!failedQuestion || loading) return;

    await sendQuestion(
      failedQuestion.question,
      failedQuestion.documentId
    );
  };

  // Clear conversation
  const handleClearChat = () => {
    if (loading) return;

    setMessages([]);
    setQuestion("");
    setError("");
    setFailedQuestion(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">
          Chat with Documents
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Ask questions and get AI-powered answers from your PDFs.
        </p>
      </div>

      {/* Document Selection */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-medium text-slate-700">
          Select document
        </label>

        <select
          value={selectedDocument}
          onChange={(event) => setSelectedDocument(event.target.value)}
          disabled={documentsLoading || loading}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 sm:max-w-xs disabled:opacity-60"
        >
          <option value="">All documents</option>

          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.filename}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Container */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
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

          <button
            onClick={handleClearChat}
            disabled={messages.length === 0 || loading}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear chat</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          {/* Empty State */}
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

          {/* Suggested Questions */}
          {messages.length === 0 && documents.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Summarize this document",
                "What are the main topics?",
                "Explain the important points",
                "What are the key conclusions?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuestion(suggestion)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages */}
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
                {/* Markdown Response */}
                <div
                  className={`prose prose-sm max-w-none break-words ${
                    message.role === "user"
                      ? "prose-p:text-white prose-strong:text-white prose-li:text-white"
                      : "prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Source References */}
                {message.sources?.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="mb-2 text-xs font-semibold text-slate-500">
                      SOURCES
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, index) => {
                        const sourceDocument = documents.find(
                          (doc) => doc.id === source.document_id
                        );

                        return (
                          <div
                            key={`${source.chunk_id}-${index}`}
                            className="rounded-lg border border-blue-100 bg-blue-50 p-3"
                          >
                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                              <FileText className="h-4 w-4" />
                              {source.source}
                            </div>

                            <p className="mt-1 text-xs text-slate-700">
                              {sourceDocument?.filename || "Document"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Page {source.page_number}
                            </p>
                          </div>
                        );
                      })}
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

          {/* Animated Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span className="text-sm text-slate-600">
                  DocuMind is thinking
                </span>

                <div className="flex gap-1">
                  {[0, 1, 2].map((item) => (
                    <span
                      key={item}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500"
                      style={{ animationDelay: `${item * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message and Retry */}
        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-red-100 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>

            {failedQuestion && (
              <button
                onClick={handleRetry}
                disabled={loading}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Question Input */}
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
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
          />

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Send question"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
