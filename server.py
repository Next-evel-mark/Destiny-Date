from flask import Flask, request, jsonify
import json, os
from datetime import datetime, timedelta

app = Flask(__name__)
DATA_FILE = "data.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return {"users": {}}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

def now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@app.route("/signup", methods=["POST"])
def signup():
    data = load_data()
    req = request.get_json()
    email = req["email"].lower()
    password = req["password"]
    if email in data["users"]:
        return "Email already exists!"
    data["users"][email] = {
        "password": password,
        "coins": 10,
        "lastClaim": None,
        "bots": []
    }
    save_data(data)
    return "Signup successful! You received 10 free coins."

@app.route("/login", methods=["POST"])
def login():
    data = load_data()
    req = request.get_json()
    email = req["email"].lower()
    password = req["password"]
    if email not in data["users"] or data["users"][email]["password"] != password:
        return jsonify({"success": False, "message": "Invalid email or password"})
    return jsonify({"success": True, "user": {"email": email}})

@app.route("/claim", methods=["POST"])
def claim():
    data = load_data()
    req = request.get_json()
    email = req["email"].lower()
    user = data["users"][email]
    last = user["lastClaim"]
    now = datetime.now()
    if last and (now - datetime.strptime(last, "%Y-%m-%d %H:%M:%S")).total_seconds() < 86400:
        return "You already claimed today."
    user["coins"] += 10
    user["lastClaim"] = now_str()
    save_data(data)
    return "You claimed 10 coins successfully!"

@app.route("/host", methods=["POST"])
def host():
    data = load_data()
    req = request.get_json()
    email = req["email"].lower()
    repo = req["repo"]
    user = data["users"][email]
    if user["coins"] < 10:
        return "Not enough coins!"
    user["coins"] -= 10
    end_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
    user["bots"].append({"repo": repo, "endDate": end_date, "active": True})
    save_data(data)
    return f"Hosted bot '{repo}' for 7 days."

@app.route("/user/<email>")
def user_info(email):
    data = load_data()
    email = email.lower()
    if email not in data["users"]:
        return jsonify({"error": "Not found"}), 404
    user = data["users"][email]
    # deactivate expired bots
    for bot in user["bots"]:
        if datetime.strptime(bot["endDate"], "%Y-%m-%d %H:%M:%S") < datetime.now():
            bot["active"] = False
    save_data(data)
    return jsonify({"email": email, "coins": user["coins"], "bots": user["bots"]})

if __name__ == "__main__":
    app.run(debug=True)
