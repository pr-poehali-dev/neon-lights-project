"""Регистрация, вход и профиль пользователя"""
import json, os, hashlib, hmac, secrets, time
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
SECRET_KEY = os.environ.get("JWT_SECRET", "change_me_in_prod_please")

def make_token(user_id: int) -> str:
    payload = f"{user_id}:{int(time.time()) + 86400 * 30}"
    sig = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{sig}"

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

def hash_password(password: str) -> str:
    salt = hashlib.sha256(os.urandom(32)).hexdigest()
    pw = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
    return f"{salt}:{pw}"

def check_password(password: str, stored: str) -> bool:
    try:
        salt, pw = stored.split(":", 1)
        check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
        return hmac.compare_digest(check, pw)
    except Exception:
        return False

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
}

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
        if method == "POST" and path.endswith("/register"):
            email = body.get("email", "").lower().strip()
            password = body.get("password", "")
            name = body.get("name", "").strip()
            if not email or not password or not name:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}
            if len(password) < 6:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пароль минимум 6 символов"})}
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
            if cur.fetchone():
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Email уже зарегистрирован"})}
            pw_hash = hash_password(password)
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id, email, name, is_subscribed, lang",
                (email, pw_hash, name)
            )
            row = cur.fetchone()
            conn.commit()
            user = {"id": row[0], "email": row[1], "name": row[2], "is_subscribed": row[3], "lang": row[4]}
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"token": make_token(row[0]), "user": user})}

        elif method == "POST" and path.endswith("/login"):
            email = body.get("email", "").lower().strip()
            password = body.get("password", "")
            cur.execute(f"SELECT id, email, name, password_hash, is_subscribed, lang FROM {SCHEMA}.users WHERE email = %s", (email,))
            row = cur.fetchone()
            if not row or not check_password(password, row[3]):
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}
            user = {"id": row[0], "email": row[1], "name": row[2], "is_subscribed": row[4], "lang": row[5]}
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"token": make_token(row[0]), "user": user})}

        elif method == "GET" and path.endswith("/me"):
            uid = verify_token(token)
            if not uid:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
            cur.execute(f"SELECT id, email, name, is_subscribed, lang FROM {SCHEMA}.users WHERE id = %s", (uid,))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Пользователь не найден"})}
            user = {"id": row[0], "email": row[1], "name": row[2], "is_subscribed": row[3], "lang": row[4]}
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"user": user})}

        elif method == "PUT" and path.endswith("/lang"):
            uid = verify_token(token)
            if not uid:
                return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
            lang = body.get("lang", "ru")
            cur.execute(f"UPDATE {SCHEMA}.users SET lang = %s WHERE id = %s", (lang, uid))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
    finally:
        cur.close()
        conn.close()
