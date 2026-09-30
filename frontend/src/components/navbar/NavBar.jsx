import "./NavBar.css";

const menuItems = [
    { label: "서비스 소개", href: "#service" },
    { label: "커뮤니티", href: "#community" },
    { label: "피드백 보내기", href: "#feedback" },
    { label: "개발자 소개", href: "#introduce" },
];

export default function NavBar({ 
    loggedIn,
    onLogoClick,
    onLoginClick,
    onSignupClick,
}) {
    return (
        <header className="main-navbar">
            <button
                type="button"
                className="main-navbar__logo"
                onClick={onLogoClick}
                aria-label="홈으로 이동"
            >
                {/* 실제 로고 이미지가 생기면 이 부분을 img로 교체 */}
                <span>A</span>
            </button>

            <div className="main-navbar__row">
                <nav
                    className="main-navbar__navigation"
                    aria-label="메인 메뉴"
                >
                    <ul className="main-navbar__menu">
                        {menuItems.map((item) => (
                            <li key={item.label}>
                                <a
                                    className="main-navbar__link"
                                    href={item.href}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                {!loggedIn && (
                    <div className="main-navbar__actions">
                        <button
                            type="button"
                            className="main-navbar__login-button"
                            onClick={onLoginClick}
                        >
                            로그인
                        </button>
                        <button
                            type="button"
                            className="main-navbar__signup-button"
                            onClick={onSignupClick}
                        >
                            회원가입
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}