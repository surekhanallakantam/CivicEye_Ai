# CivicEye AI - FastAPI Backend

Minimal backend scaffold for CivicEye AI.

Run (development):

```bash
cd backend/fastapi
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Environment:

- Copy `.env.example` to `.env` and fill in Supabase and AI provider values.
 - Set `AI_PROVIDER` to `gemini`, `huggingface`, or `groq`.
 - Place provider API keys in `GEMINI_API_KEY`, `HF_API_KEY`, or `GROQ_API_KEY` and set `GROQ_ENDPOINT` as needed.

Endpoints added (mock implementations):

- `POST /api/v1/ai/analyze` - analyze complaint payload (returns category, department, severity, confidence, summary)
- `POST /api/v1/ai/generate` - generate normalized complaint text
