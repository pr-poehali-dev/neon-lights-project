"""Чат с GPT: управление сессиями и отправка сообщений"""
import json, os, hmac, hashlib, time
import psycopg2
import urllib.request

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
SECRET_KEY = os.environ.get("JWT_SECRET", "change_me_in_prod_please")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
}

def verify_token(token: str):
    try:
        parts = token.split(":")
        if len(parts) != 3:
            return None
        user_id, exp, sig = parts
        if int(exp) < int(time.time()):
            return None
        expected = hmac.new(SECRET_KEY.encode(), f"{user_id}:{exp}".encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        return int(user_id)
    except Exception:
        return None

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

SYSTEM_PROMPTS = {
    "ru": "Ты умный персональный ИИ-ассистент. Отвечай на русском языке. Будь полезным, точным и дружелюбным.",
    "en": "You are a smart personal AI assistant. Reply in English. Be helpful, accurate and friendly.",
    "de": "Du bist ein smarter persönlicher KI-Assistent. Antworte auf Deutsch. Sei hilfsbereit, genau und freundlich.",
    "zh": "你是一个智能个人AI助手。用中文回复。保持有帮助、准确和友好。",
}

def ask_openai(messages: list, lang: str = "ru") -> str:
    system = SYSTEM_PROMPTS.get(lang, SYSTEM_PROMPTS["ru"])
    full_messages = [{"role": "system", "content": system}] + messages
    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": full_messages,
        "max_tokens": 2000,
        "temperature": 0.7,
    }).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read())
    return data["choices"][0]["message"]["content"]

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    body = json.loads(event.get("body") or "{}")
    auth_header = event.get("headers", {}).get("X-Authorization", "") or event.get("headers", {}).get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip() if auth_header else ""

    uid = verify_token(token)
    if not uid:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    conn = get_conn()
    cur = conn.cursor()

    try:
        # Check subscription
        cur.execute(f"SELECT is_subscribed, lang FROM {SCHEMA}.users WHERE id = %s", (uid,))
        user_row = cur.fetchone()
        if not user_row:
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Пользователь не найден"})}
        is_subscribed, user_lang = user_row

        # GET /sessions — список чатов
        if method == "GET" and path.endswith("/sessions"):
            cur.execute(
                f"SELECT id, title, updated_at FROM {SCHEMA}.chat_sessions WHERE user_id = %s ORDER BY updated_at DESC LIMIT 50",
                (uid,)
            )
            sessions = [{"id": r[0], "title": r[1], "updated_at": r[2].isoformat()} for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"sessions": sessions})}

        # POST /sessions — создать новый чат
        elif method == "POST" and path.endswith("/sessions"):
            if not is_subscribed:
                return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "subscription_required"})}
            cur.execute(
                f"INSERT INTO {SCHEMA}.chat_sessions (user_id) VALUES (%s) RETURNING id, title, updated_at",
                (uid,)
            )
            row = cur.fetchone()
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"session": {"id": row[0], "title": row[1], "updated_at": row[2].isoformat()}})}

        # GET /sessions/{id}/messages — история сообщений
        elif method == "GET" and "/messages" in path:
            parts = path.split("/")
            session_id = int(parts[-2]) if parts[-1] == "messages" else None
            if not session_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Bad request"})}
            cur.execute(f"SELECT user_id FROM {SCHEMA}.chat_sessions WHERE id = %s", (session_id,))
            s = cur.fetchone()
            if not s or s[0] != uid:
                return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
            cur.execute(
                f"SELECT role, content, created_at FROM {SCHEMA}.messages WHERE session_id = %s ORDER BY created_at ASC",
                (session_id,)
            )
            msgs = [{"role": r[0], "content": r[1], "created_at": r[2].isoformat()} for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"messages": msgs})}

        # POST /sessions/{id}/messages — отправить сообщение
        elif method == "POST" and "/messages" in path:
            if not is_subscribed:
                return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "subscription_required"})}
            parts = path.split("/")
            session_id = int(parts[-2]) if parts[-1] == "messages" else None
            if not session_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Bad request"})}
            cur.execute(f"SELECT user_id FROM {SCHEMA}.chat_sessions WHERE id = %s", (session_id,))
            s = cur.fetchone()
            if not s or s[0] != uid:
                return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}

            user_message = body.get("content", "").strip()
            if not user_message:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пустое сообщение"})}

            # Save user message
            cur.execute(
                f"INSERT INTO {SCHEMA}.messages (session_id, role, content) VALUES (%s, 'user', %s)",
                (session_id, user_message)
            )

            # Get last 20 messages for context
            cur.execute(
                f"SELECT role, content FROM {SCHEMA}.messages WHERE session_id = %s ORDER BY created_at DESC LIMIT 20",
                (session_id,)
            )
            history = [{"role": r[0], "content": r[1]} for r in reversed(cur.fetchall())]

            # Ask GPT
            reply = ask_openai(history, user_lang or "ru")

            # Save assistant reply
            cur.execute(
                f"INSERT INTO {SCHEMA}.messages (session_id, role, content) VALUES (%s, 'assistant', %s)",
                (session_id, reply)
            )

            # Update session title if first message
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.messages WHERE session_id = %s", (session_id,))
            count = cur.fetchone()[0]
            if count <= 3:
                title = user_message[:60]
                cur.execute(f"UPDATE {SCHEMA}.chat_sessions SET title = %s, updated_at = NOW() WHERE id = %s", (title, session_id))
            else:
                cur.execute(f"UPDATE {SCHEMA}.chat_sessions SET updated_at = NOW() WHERE id = %s", (session_id,))

            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"reply": reply})}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
    finally:
        cur.close()
        conn.close()
