
import { useEffect, useRef, useState } from "react";
import {
  Send,
  Bot,
  User,
  FileText,
  AlertCircle,
  Trash2,
  Plus,
  Paperclip,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Loader2,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { askQuestion, getDocuments } from "../services/api";

const suggestions = [
  {
    icon: FileText,
    title: "Summarize a document",
    question: "Summarize this document.",
  },
  {
    icon: Sparkles,
    title: "Find important details",
    question: "What are the most important points?",
  },
  {
    icon: Bot,
    title: "Explain a topic",
    question: "Explain the main topics in this document.",
  },
  {
    icon: FileText,
    title: "Find key conclusions",
    question: "What are the key conclusions?",
  },
];

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
  const inputRef = useRef(null);

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
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  const sendQuestion = async (questionText, documentId) => {
    if (loading || !questionText.trim()) return;

    setLoading(true);
    setError("");
    setFailedQuestion(null);

    try {
      const response = await askQuestion(questionText, documentId);

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.answer,
          sources: response.sources || [],
        },
      ]);
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

  const handleSuggestion = (text) => {
    setQuestion(text);
    inputRef.current?.focus();
  };

  const handleRetry = async () => {
    if (!failedQuestion || loading) return;

    await sendQuestion(
      failedQuestion.question,
      failedQuestion.documentId
    );
  };

  const handleClearChat = () => {
    if (loading) return;

    setMessages([]);
    setQuestion("");
    setError("");
    setFailedQuestion(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="relative flex h-screen min-h-0 flex-col bg-white">

      {/* Minimal Header */}
      <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold tracking-tight text-slate-800">
            Chat
          </h1>
        </div>

        <div className="flex items-center gap-2">

          {/* Document Selector */}
          <div className="relative">
            <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={selectedDocument}
              onChange={(event) =>
                setSelectedDocument(event.target.value)
              }
              disabled={documentsLoading || loading}
              className="max-w-[180px] appearance-none rounded-lg border border-transparent bg-slate-100 py-2 pl-9 pr-8 text-xs font-medium text-slate-700 outline-none transition hover:bg-slate-200 focus:border-slate-300 sm:max-w-[240px] sm:text-sm"
            >
              <option value="">All documents</option>

              {documents.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.filename}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            onClick={handleClearChat}
            disabled={messages.length === 0 || loading}
            title="New chat"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Conversation Area */}
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6">

          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="flex min-h-[55vh] flex-col items-center justify-center">

              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Sparkles className="h-6 w-6 text-slate-700" />
              </div>

              <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                What can I help you understand?
              </h2>

              <p className="mt-3 max-w-md text-center text-sm leading-6 text-slate-500">
                Ask questions about your documents and get answers
                backed by relevant passages from your PDFs.
              </p>

              {documents.length > 0 ? (
                <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  {suggestions.map((suggestion) => {
                    const Icon = suggestion.icon;

                    return (
                      <button
                        key={suggestion.title}
                        onClick={() =>
                          handleSuggestion(suggestion.question)
                        }
                        className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Icon className="h-5 w-5 shrink-0 text-slate-500" />

                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {suggestion.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Ask your documents
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-8 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Upload and process a PDF to start chatting.
                </p>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="space-y-8">
            {messages.map((message) => (
              <div key={message.id}>

                {message.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-3xl bg-slate-100 px-5 py-3 text-sm leading-7 text-slate-800 sm:max-w-[75%]">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <Bot className="h-4 w-4 text-slate-700" />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <div className="prose prose-sm max-w-none break-words leading-7 prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-indigo-600">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {/* Sources */}
                      {message.sources?.length > 0 && (
                        <div className="mt-6 border-t border-slate-100 pt-4">
                          <p className="mb-3 text-xs font-semibold text-slate-500">
                            Sources
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, index) => {
                              const sourceDocument = documents.find(
                                (doc) =>
                                  doc.id === source.document_id
                              );

                              return (
                                <div
                                  key={`${source.chunk_id}-${index}`}
                                  className="flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                                >
                                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />

                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-700">
                                      {source.source}
                                      <span className="ml-2 font-normal text-slate-400">
                                        Page {source.page_number}
                                      </span>
                                    </p>

                                    <p
                                      className="max-w-52 truncate text-xs text-slate-500"
                                      title={sourceDocument?.filename || "Document"}
                                    >
                                      {sourceDocument?.filename || "Document"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                <Bot className="h-4 w-4 text-slate-700" />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Error */}
      {error && (
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 pb-3 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>

          {failedQuestion && (
            <button
              onClick={handleRetry}
              disabled={loading}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Bottom Composer */}
      <footer className="shrink-0 bg-white px-4 pb-3 pt-2 sm:px-6 sm:pb-5">
        <div className="mx-auto w-full max-w-5xl">

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-300 bg-white px-3 py-2 shadow-sm transition focus-within:border-slate-400 focus-within:shadow-md"
          >
            <textarea
              ref={inputRef}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your documents..."
              rows={1}
              disabled={loading}
              className="max-h-40 min-h-12 w-full resize-y bg-transparent px-2 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50"
            />

            <div className="flex items-center justify-between px-1 pb-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => inputRef.current?.focus()}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  title="Focus message input"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <span className="hidden text-xs text-slate-400 sm:inline">
                  {selectedDocument
                    ? "Asking about selected document"
                    : "Searching all documents"}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            Knowvia AI can make mistakes. Verify important information using the cited sources.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Chat;
