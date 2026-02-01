#!/bin/bash
# E2Eテスト用ユーザーをシードする
# Drizzle マイグレーション後に実行すること（profiles テーブルが必要）
set -euo pipefail

# Supabase ローカルの service_role キーを取得
SERVICE_ROLE_KEY=$(supabase status -o json | jq -r '.SERVICE_ROLE_KEY // .service_role_key')

echo "=== Creating E2E test user via Admin API ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:54321/auth/v1/admin/users \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "e2etest@example.com",
    "password": "password",
    "email_confirm": true,
    "user_metadata": {"name": "E2E Test User"}
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "User created successfully (HTTP $HTTP_CODE)"
  USER_ID=$(echo "$BODY" | jq -r '.id')
  echo "User ID: $USER_ID"
else
  echo "Failed to create user (HTTP $HTTP_CODE)"
  echo "$BODY"
  exit 1
fi

echo "=== Ensuring profile exists ==="
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -c \
  "INSERT INTO profiles (id, name) VALUES ('$USER_ID', 'E2E Test User') ON CONFLICT (id) DO NOTHING;"

echo "=== Seed complete ==="
