import requests
import random
from faker import Faker

BASE_URL = "http://localhost:3000"
fake = Faker()

USERNAMES = ["mark1", "augustus", "maria", "lucy", "oliver"]
NAMES = ["Mark Geller", "Augustus Smith", "Maria Garcia", "Lucy Brown", "Oliver Miller"]
PASSWORD = "Password@123"  # meets schema requirements

users = []
tokens = []
posts = []

# 1. Register users
for username, name in zip(USERNAMES, NAMES):
    email = f"{username}@example.com"
    profile_picture = fake.image_url()
    bio = fake.sentence()
    resp = requests.post(
        f"{BASE_URL}/user/register",
        json={
            "username": username,
            "email": email,
            "password": PASSWORD,
            "name": name,
            "bio": bio,
            "profilePicture": profile_picture,
        },
    )
    data = resp.json()
    print(f"Register {username}: {data.get('message')}")
    users.append({"username": username, "userId": data.get("userId")})
    tokens.append(data.get("token"))

# 2. Each user logs in (to get fresh tokens)
for i, username in enumerate(USERNAMES):
    resp = requests.post(
        f"{BASE_URL}/user/login",
        json={"username": username, "password": PASSWORD},
    )
    data = resp.json()
    tokens[i] = data.get("token")
    users[i]["userId"] = data.get("userId")

# 3. Each user creates 3 posts
for i, user in enumerate(users):
    for _ in range(3):
        content = fake.paragraph(nb_sentences=random.randint(2, 6))
        resp = requests.post(
            f"{BASE_URL}/post/create",
            json={"authorId": user["userId"], "content": content},
            headers={"Authorization": f"Bearer {tokens[i]}"},
        )
        data = resp.json()
        print(f"Post by {user['username']}: {data.get('message')}")
        if data.get("success"):
            posts.append({"postId": data["data"]["_id"], "author": user["username"]})

# 4. Add comments (at least 2 per post, by random users)
for post in posts:
    for _ in range(2):
        commenter_idx = random.randint(0, len(users) - 1)
        comment_content = fake.sentence()
        resp = requests.post(
            f"{BASE_URL}/comment/create",
            json={
                "authorId": users[commenter_idx]["userId"],
                "postId": post["postId"],
                "content": comment_content,
            },
            headers={"Authorization": f"Bearer {tokens[commenter_idx]}"},
        )
        data = resp.json()
        print(f"Comment on post {post['postId']} by {users[commenter_idx]['username']}: {data.get('message')}")

# 5. Randomly like posts
for i, user in enumerate(users):
    liked_posts = random.sample(posts, k=random.randint(2, len(posts)))
    for post in liked_posts:
        resp = requests.post(
            f"{BASE_URL}/post/{post['postId']}/like",
            headers={"Authorization": f"Bearer {tokens[i]}"},
        )
        data = resp.json()
        print(f"{user['username']} liked/unliked post {post['postId']}: {data.get('message')}")

print("Database seeded!")
