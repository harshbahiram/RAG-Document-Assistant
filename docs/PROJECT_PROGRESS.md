# RAG Document Assistant — Project Progress

## 1. Project Overview

**Project Name:** RAG Document Assistant

**Objective:** Build an AI-powered document assistant that allows users to upload PDF documents and ask questions about their content using Retrieval-Augmented Generation (RAG).

The system will extract PDF text, divide it into smaller chunks, generate embeddings, store them in a vector database, retrieve relevant information, and generate context-based answers using an LLM.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| PDF Extraction | PyMuPDF |
| Text Chunking | Custom Python service (planned) |
| Embedding Model | Sentence Transformers — all-MiniLM-L6-v2 |
| Vector Database | Supabase PostgreSQL + pgvector |
| Embedding Dimensions | 384 |
| LLM | Google Gemini API |
| Database ORM | SQLAlchemy |
| Database Driver | Psycopg 3 |
| Storage | Supabase Storage |
| API Testing | FastAPI Swagger / Postman |
| Deployment | Vercel + Render |

## 3. Completed Development Phases

### Phase 1 — Environment and Initial Setup

Status: COMPLETED

- Created the project repository and directory structure.
- Created the documentation directory.
- Configured Python virtual environment.
- Installed backend dependencies.
- Configured Git exclusions.
- Created the initial FastAPI application.
- Verified FastAPI endpoints and Swagger documentation.
- Created a Supabase project.
- Enabled the pgvector extension.
- Verified the vector extension.

### Phase 2 — Database Schema and Supabase Integration

Status: COMPLETED

Created two PostgreSQL tables.

**documents**

Stores document metadata:

- id (UUID primary key)
- filename
- storage_bucket
- storage_path
- mime_type
- file_size
- status
- error_message
- created_at
- updated_at

**document_chunks**

Stores extracted document chunks and embeddings:

- id (primary key)
- document_id (foreign key)
- content
- page_number
- chunk_index
- embedding (vector(384))
- created_at

Additional database configuration:

- Enabled Row Level Security.
- Created document status constraints.
- Added document and chunk indexes/constraints.
- Created an updated_at trigger.
- Created the match_document_chunks semantic search function.
- Created a private Supabase Storage bucket named documents.

**Backend integration:**

- Configured SQLAlchemy.
- Configured Psycopg 3.
- Established the Supabase PostgreSQL connection.
- Created SQLAlchemy Document and DocumentChunk models.
- Successfully tested database operations.

### Phase 3 — PDF Upload and Text Extraction

Status: PDF upload and extraction integration COMPLETED.

#### 3.1 Supabase Storage Integration

- Installed the Supabase Python SDK.
- Configured Supabase environment variables.
- Created a reusable Supabase client.
- Verified access to the private documents bucket.
- Implemented PDF upload and delete functions.
- Implemented PDF download functionality.

#### 3.2 PDF Upload API

Implemented:

- PDF filename validation.
- PDF extension validation.
- Basic PDF signature validation.
- Empty-file validation.
- 20 MB file-size restriction.
- Unique UUID-based storage paths.
- PDF upload to Supabase Storage.
- Document metadata insertion into PostgreSQL.
- Cleanup attempt when database insertion fails.

Endpoint:

POST /api/documents/upload

Successfully tested using FastAPI Swagger.

#### 3.3 PDF Text Extraction

Installed PyMuPDF.

Created the PDF extraction service:

app/services/pdf_service.py

Implemented:

- Opening PDF documents from memory.
- Extracting text page by page.
- Preserving page numbers.
- Skipping pages without extractable text.

Successfully tested text extraction using a sample PDF.

#### 3.4 Document Processing Integration

Created:

app/services/document_processing_service.py

Implemented:

- Retrieving document metadata using document UUID.
- Downloading the original PDF from Supabase Storage.
- Extracting PDF text using PyMuPDF.
- Calculating page count and total extracted characters.
- Returning extracted text previews.

Endpoint:

POST /api/documents/{document_id}/extract

Successfully tested the integrated upload-to-extraction workflow.

**Current limitation:** Extracted text is currently returned as a preview and is not yet persisted in the document_chunks table. Documents remain in processing status until the complete processing pipeline is implemented.

## 4. Current Backend Structure

backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   └── documents.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── supabase.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── test_db.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── document.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── storage_service.py
│   │   ├── document_service.py
│   │   ├── pdf_service.py
│   │   ├── test_pdf_service.py
│   │   └── document_processing_service.py
│   └── main.py
├── .env
└── requirements.txt

## 5. Current API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | / | API welcome message |
| GET | /health | Backend health check |
| GET | /health/db | Database connectivity check |
| POST | /api/documents/upload | Upload PDF |
| POST | /api/documents/{document_id}/extract | Extract PDF text |

## 6. Upcoming Development Phases

### Phase 4 — Text Chunking and Storage

- Implement text chunking.
- Preserve document IDs and page numbers.
- Handle overlapping chunks.
- Store chunks in document_chunks.
- Update document processing status.

### Phase 5 — Embedding Generation

- Integrate Sentence Transformers.
- Generate 384-dimensional embeddings.
- Generate embeddings for document chunks.
- Store embeddings in pgvector.
- Implement batch processing.

### Phase 6 — Semantic Retrieval and RAG

- Implement similarity search.
- Integrate the match_document_chunks function.
- Retrieve relevant chunks.
- Integrate Google Gemini API.
- Build context-based question answering.
- Handle questions with insufficient document context.
- Return source document and page references.

### Phase 7 — React Frontend

- Build document upload interface.
- Display uploaded documents.
- Display processing status.
- Build question-answering interface.
- Display answers with source references.
- Integrate frontend with FastAPI.

### Phase 8 — Testing and Deployment

- Backend and frontend integration testing.
- Retrieval quality evaluation.
- Error handling and optimization.
- Deployment on Render and Vercel.
- Production environment configuration.

## 7. Current Project Status

Completed:
- Environment setup.
- Supabase database configuration.
- PostgreSQL integration.
- SQLAlchemy models.
- Supabase Storage integration.
- PDF upload API.
- PDF text extraction.
- Document processing integration.

In progress:
- Completing the document processing pipeline.

Not started:
- Text chunking.
- Embedding generation.
- Semantic retrieval.
- Gemini integration.
- React frontend.
- Production deployment.

## 8. Important Development Decisions

1. Use Supabase Storage for persistent PDF files.
2. Use PostgreSQL for document metadata and extracted chunks.
3. Use pgvector for semantic similarity search.
4. Use all-MiniLM-L6-v2 with 384-dimensional embeddings initially.
5. Keep backend credentials in environment variables.
6. Keep document processing services separate from API routes.
7. Preserve page numbers to support source references in future answers.
8. Do not mark documents completed until all required processing steps succeed.

---

**Last Updated:** 5 November 2026

**Current Milestone:** PDF upload and text extraction working successfully.