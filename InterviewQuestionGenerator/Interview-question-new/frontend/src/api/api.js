// Use VITE_API_URL environment variable for production, or local for development
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5003";

/**
 * Safely parse a fetch Response as JSON.
 * If the body is empty or not valid JSON, throws a descriptive error.
 */
async function safeJson(res) {
  const text = await res.text();
  if (!text || text.trim() === "") {
    throw new Error(
      `Server returned an empty response (HTTP ${res.status}). The backend may have crashed. Check the terminal.`
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    // Backend returned HTML (e.g. a Flask error page)
    throw new Error(
      `Server returned a non-JSON response (HTTP ${res.status}). The backend may have crashed. Check the terminal.`
    );
  }
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${API_BASE}/api/upload-resume`, {
    method: "POST",
    body: formData,
  });

  const data = await safeJson(res);
  if (!res.ok || data?.error) {
    throw new Error(data?.error || "Failed to upload resume.");
  }

  if (!data?.text) {
    throw new Error(
      "No text extracted from resume. Please upload a text-based PDF (not a scanned image)."
    );
  }

  return data.text;
}

export async function generateQuestions(resumeText) {
  const res = await fetch(`${API_BASE}/api/generate-questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_text: resumeText }),
  });

  const data = await safeJson(res);
  if (!res.ok || data?.error) {
    throw new Error(data?.error || "Failed to generate questions.");
  }

  return data;
}