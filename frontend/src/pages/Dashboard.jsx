function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Dashboard
      </h1>

      <p className="text-slate-500 mt-2">
        Manage your documents and explore your knowledge base.
      </p>

      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-slate-800">
          Welcome to DocuMind AI
        </h2>

        <p className="text-slate-500 mt-2">
          Upload your PDF documents and start asking questions.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;