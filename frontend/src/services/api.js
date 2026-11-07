import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,
});

export const getDocuments = async () => {
  const response = await api.get("/api/documents/");
  return response.data;
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/documents/upload", formData);
  return response.data;
};

export const processDocument = async (documentId) => {
  const response = await api.post(`/api/documents/${documentId}/process`);
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/api/documents/${documentId}`);
  return response.data;
};

export const askQuestion = async (question, documentId = null) => {
  const response = await api.post("/api/chat/ask", {
    question,
    document_id: documentId,
    match_count: 5,
  });
  return response.data;
};

export default api;