users = [
    {
        "username": "test",
        "password": "1234"
    }
]


def find_user(username):
    for user in users:
        if user["username"] == username:
            return user

    return None