function Chat() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Chat with Documents
      </h1>

      <p className="text-slate-500 mt-2">
        Ask questions and get answers from your uploaded PDFs.
      </p>

      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-8">
        <p className="text-slate-500">
          Your document conversation will appear here.
        </p>
      </div>
    </div>
  );
}

export default Chat;