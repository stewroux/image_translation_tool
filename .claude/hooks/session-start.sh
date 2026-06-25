#!/bin/bash
# Session-start hook for Claude Code on the web
# Runs automatically when a new Claude Code session starts

set -e

echo "[session-start] Installing dependencies..."
npm ci --prefer-offline 2>/dev/null || npm install

echo "[session-start] Running linter (non-blocking)..."
npm run lint 2>&1 || true

echo "[session-start] Session ready."
