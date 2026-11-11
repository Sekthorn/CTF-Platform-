FROM python:3.11-alpine
WORKDIR /app
RUN adduser -D -u 10005 ctfuser
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
USER ctfuser
EXPOSE 8080
CMD ["python", "app.py"]
