import { useState } from "react";
import { login } from "../../api/auth.js";

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(event) {
        event.preventDefault();

        try {
            const data = await login(username, password);

            if (data.success) {
                onLogin();
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디"
            />

            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
            />

            <button type="submit">
                로그인
            </button>
        </form>
    );
}