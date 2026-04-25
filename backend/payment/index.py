"""Создание платежей ЮKassa и обработка вебхуков"""
import json, os, hmac, hashlib, time, uuid
import psycopg2
import urllib.request

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
SECRET_KEY = os.environ.get("JWT_SECRET", "change_me_in_prod_please")
YUKASSA_SHOP_ID = os.environ.get("YUKASSA_SHOP_ID", "")
YUKASSA_SECRET_KEY = os.environ.get("YUKASSA_SECRET_KEY", "")
APP_URL = os.environ.get("APP_URL", "https://localhost")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

def create_yukassa_payment(user_id: int, return_url: str) -> dict:
    idempotence_key = str(uuid.uuid4())
    payload = {
        "amount": {"value": "89.00", "currency": "RUB"},
        "confirmation": {"type": "redirect", "return_url": return_url},
        "capture": True,
        "description": f"Подписка УмныйAI — 1 месяц (user {user_id})",
        "metadata": {"user_id": str(user_id)},
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        "https://api.yookassa.ru/v3/payments",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Idempotence-Key": idempotence_key,
        },
        method="POST",
    )
    import base64
    creds = base64.b64encode(f"{YUKASSA_SHOP_ID}:{YUKASSA_SECRET_KEY}".encode()).decode()
    req.add_header("Authorization", f"Basic {creds}")
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    body = json.loads(event.get("body") or "{}")
    auth_header = event.get("headers", {}).get("X-Authorization", "") or event.get("headers", {}).get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip() if auth_header else ""

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "POST" and path.endswith("/create"):
            uid = verify_token(token)
            if not uid:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

            return_url = body.get("return_url", f"{APP_URL}/chat")
            payment_resp = create_yukassa_payment(uid, return_url)
            payment_id = payment_resp["id"]
            confirm_url = payment_resp["confirmation"]["confirmation_url"]

            cur.execute(
                f"INSERT INTO {SCHEMA}.payments (user_id, payment_id, status) VALUES (%s, %s, 'pending')",
                (uid, payment_id)
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"payment_url": confirm_url, "payment_id": payment_id})}

        elif method == "POST" and path.endswith("/webhook"):
            event_type = body.get("event", "")
            obj = body.get("object", {})
            payment_id = obj.get("id")
            status = obj.get("status")
            user_id = obj.get("metadata", {}).get("user_id")

            if event_type == "payment.succeeded" and payment_id:
                cur.execute(f"UPDATE {SCHEMA}.payments SET status = 'succeeded' WHERE payment_id = %s", (payment_id,))
                if user_id:
                    import datetime
                    expires = datetime.datetime.utcnow() + datetime.timedelta(days=31)
                    cur.execute(
                        f"UPDATE {SCHEMA}.users SET is_subscribed = TRUE, subscription_expires_at = %s WHERE id = %s",
                        (expires, int(user_id))
                    )
                conn.commit()

            elif event_type == "payment.canceled" and payment_id:
                cur.execute(f"UPDATE {SCHEMA}.payments SET status = 'canceled' WHERE payment_id = %s", (payment_id,))
                conn.commit()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        elif method == "GET" and path.endswith("/status"):
            uid = verify_token(token)
            if not uid:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
            cur.execute(
                f"SELECT is_subscribed, subscription_expires_at FROM {SCHEMA}.users WHERE id = %s",
                (uid,)
            )
            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Не найден"})}
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                "is_subscribed": row[0],
                "expires_at": row[1].isoformat() if row[1] else None,
            })}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
    finally:
        cur.close()
        conn.close()
