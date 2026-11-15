<div align="center">

# Knowvia

**RAG Document Assistant — chat with your PDFs and follow answers back to their source pages.**

[![License: MIT](https://img.shields.io/badge/license-MIT-4f46e5.svg)](./LICENSE)
![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-3776AB.svg?logo=python&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-149ECA.svg?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-API-009688.svg?logo=fastapi&logoColor=white)

[Features](#features) · [How it works](#how-it-works) · [Quick start](#quick-start) · [API](#api-reference) · [License](#license)

</div>

---

Knowvia is a full-stack application for uploading PDF documents and asking questions about their contents. It retrieves relevant passages from your documents and returns answers with page citations.

## Contents

- [Features](#features)
- [How it works](#how-it-works)
- [Technology](#technology)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Database prerequisites](#database-prerequisites)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Limitations](#limitations)
- [License](#license)

## Features

- **Authentication:** sign up and sign in through Supabase Auth.
- **PDF library:** upload, filter the library by filename, and delete PDFs up to 20 MB.
- **Document processing:** extract text, split it into overlapping chunks, and generate 384-dimensional embeddings.
- **Grounded chat:** ask questions across all processed PDFs or select one document.
- **Page citations:** answers include references to the source pages used.
- **Health checks:** inspect API and database connectivity.

## How it works

```mermaid
flowchart LR
    U[User] -->|Sign in| AUTH[Supabase Auth]
    AUTH -->|Session| A[React app]
    A -->|PDF + access token| API[FastAPI]
    API -->|Store PDF| S[Supabase Storage]
    API -->|Save document metadata| DB[(PostgreSQL + pgvector)]
    API -->|Extract, chunk, embed| P[Document processing in FastAPI]
    P -->|Save vectors| DB
    A -->|Question + access token| API
    API -->|Embed question and find passages| DB
    API -->|Context-grounded prompt| G[Google Gemini]
    G -->|Answer with citations| A
```

## Technology

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Supabase JS |
| API | Python, FastAPI, SQLAlchemy |
| Authentication and file storage | Supabase Auth and Storage |
| Data and retrieval | PostgreSQL, pgvector |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` |
| Answer generation | Google Gemini |

## Quick start

### Prerequisites

- Python 3.10 or later (the source uses Python 3.10 type syntax)
- Node.js 20.19+ or 22.12+ and npm (Vite 8 requirement)
- A Supabase project with Auth, Storage, and PostgreSQL
- A Google Gemini API key

### 1. Configure services

Set up the Supabase database and storage bucket as described in [Database prerequisites](#database-prerequisites), then create the backend and frontend environment files shown under [Configuration](#configuration).

### 2. Start the backend

In PowerShell:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

On macOS or Linux, activate the virtual environment with `source venv/bin/activate`.

### 3. Start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal, normally [http://localhost:5173](http://localhost:5173). The first document-processing run downloads the embedding model and may take longer.

<details>
<summary><strong>Run checks</strong></summary>

From `frontend/`, run the available lint and production-build checks:

```powershell
npm run lint
npm run build
```

</details>

## Configuration

<details>
<summary><strong>Backend: create <code>backend/.env</code></strong></summary>

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key

# Optional (these are the defaults)
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_BUCKET_NAME=documents
```

`DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are required at API startup. `GEMINI_API_KEY` is required for generating chat answers. Keep the service-role and Gemini keys on the backend; never expose them in frontend variables.

</details>

<details>
<summary><strong>Frontend: create <code>frontend/.env.local</code></strong></summary>

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Use the URL and anon key from the same Supabase project configured for the backend. The API's local CORS allowlist includes `http://localhost:5173` and `http://127.0.0.1:5173`.

</details>

## Database prerequisites

The repository does not include database migrations or SQL setup scripts. Provision the database before starting the API. It expects:

- The `documents` and `document_chunks` tables defined by the backend models.
- pgvector available as `extensions.vector`, with a vector column sized to 384 dimensions.
- A `public.match_document_chunks` function that accepts a query vector, user ID, match count, and optional document ID, and returns matching chunk IDs, document IDs, content, page numbers, chunk indices, and similarity scores.
- A Supabase Storage bucket named `documents`, or a custom bucket set through `SUPABASE_BUCKET_NAME`.

## API reference

Open the interactive FastAPI documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) after starting the backend.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `GET` | `/health/db` | Database connectivity check |
| `GET` | `/api/documents/` | List the signed-in user's documents |
| `POST` | `/api/documents/upload` | Upload a PDF |
| `POST` | `/api/documents/{document_id}/extract` | Extract text from a PDF |
| `POST` | `/api/documents/{document_id}/process` | Extract, chunk, and embed a PDF |
| `DELETE` | `/api/documents/{document_id}` | Delete a PDF and its document record |
| `POST` | `/api/chat/ask` | Ask a question about uploaded documents |

Document and chat endpoints require a Supabase access token in the `Authorization: Bearer <token>` header.

## Project structure

```text
backend/
  app/
    api/          # Document and chat routes
    core/         # Configuration, Supabase clients, authentication
    db/           # SQLAlchemy database and models
    schemas/      # API request and response schemas
    services/     # PDF, storage, embedding, retrieval, and RAG logic
  requirements.txt
frontend/
  src/
    components/   # Layout and route guards
    context/      # Authentication state
    pages/        # Login, registration, dashboard, and chat
    services/     # Supabase auth and API requests
    lib/          # Supabase client
```

## Limitations

- Scanned or image-only PDFs are not OCR-processed and may have no extractable text.
- Password-protected PDFs are not supported.
- PDF uploads are limited to 20 MB.

## License

This project is distributed under the [MIT License](./LICENSE).
