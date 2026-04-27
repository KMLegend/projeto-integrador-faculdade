FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for pymysql/sqlalchemy if needed
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Backend folder content to /app/Backend so imports like 'Backend.presentation' work
# OR copy the parent folder. But main.py is in /app/Backend? 
# Let's place main.py and the folders directly in /app and fix imports if needed, 
# OR keep the structure. The user has c:\...\Backend.
# If we WORKDIR /app, and COPY . /app/Backend, then main.py is in /app/Backend/main.py.

COPY . .

ENV PYTHONPATH=/app
ENV DATABASE_URL=mysql+pymysql://root:root@db:3306/agenda_quick

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
