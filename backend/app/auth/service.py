from app.auth.repository import find_user


def login(request):
    user = find_user(request.username)

    if user is None:
        return {
            "success": False
        }

    if user["password"] != request.password:
        return {
            "success": False
        }

    return {
        "success": True
    }