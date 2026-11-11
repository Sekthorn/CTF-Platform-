# ==========================================
# WebSec CTF - Vulnerable Challenge Dockerfile Template
# ==========================================
FROM python:3.11-alpine

# Set non-interactive environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Create unprivileged service user
RUN adduser -D -u 1000 ctfuser

# Install requirements if present
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt || true

# Copy challenge application source
COPY . .

# Store flag in standard location with appropriate permissions
RUN echo "WEBSEC{sample_flag_proof_of_concept_2026}" > /flag.txt && \
    chmod 444 /flag.txt

USER ctfuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/').getcode()" || exit 1

CMD ["python", "app.py"]
