import requests
import random
from faker import Faker

BASE_URL = "http://localhost:3000"
fake = Faker()

USERNAMES = ["mark1", "augustus", "maria", "lucy", "oliver", 'bine']
NAMES = ["Mark Geller", "Augustus Smith", "Maria Garcia", "Lucy Brown", "Oliver Miller", 'Bine']
PASSWORD = "Password@123"  # meets schema requirements

users = []
tokens = []
posts = []

# 1. Register users
for username, name in zip(USERNAMES, NAMES):
    email = f"{username}@example.com"
    # Use a unique random image for each user
    profile_picture = f"https://picsum.photos/200?random={random.randint(1, 10000)}"
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

# 6. Randomly follow each other
num_follows = len(users) * 2  # Each user will follow about 2 others on average
follows = set()
for _ in range(num_follows):
    follower_idx = random.randint(0, len(users) - 1)
    following_idx = random.randint(0, len(users) - 1)
    if follower_idx == following_idx:
        continue  # Skip self-follow
    follower = users[follower_idx]
    following = users[following_idx]
    key = (follower["userId"], following["userId"])
    if key in follows:
        continue  # Skip duplicate follow
    follows.add(key)
    resp = requests.post(
        f"{BASE_URL}/follow/toggle",
        json={"targetUsername": following["username"]},
        headers={"Authorization": f"Bearer {tokens[follower_idx]}"},
    )
    data = resp.json()
    print(f"{follower['username']} followed/unfollowed {following['username']}: {data.get('message')}")
