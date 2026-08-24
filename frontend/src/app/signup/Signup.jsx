import { useState } from "react";
import { signup } from "../../api/auth.js";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            await signup(username, nickname, password);
            setMessage("회원가입이 완료되었습니다.");
        } catch (error) {
            setMessage(error.message);
        }
    }

    return (
        <div className="signup-page">
            <h1>회원가입</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="아이디"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">
                    회원가입
                </button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}
