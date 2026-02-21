#!/usr/bin/env bash

set -e

echo "Starting SAFFRON AI Honeypot API..."

uvicorn app.api.main:app \
  --host 0.0.0.0 \
  --port 10000
