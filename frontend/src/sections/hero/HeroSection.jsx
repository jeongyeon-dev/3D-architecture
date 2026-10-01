import "./HeroSection.css";

export default function HeroSection({ onStartClick }) {
    return (
        <section className="hero-section">
            <div className="hero-section__content">
                <h1 className="hero-section__title">
                    무한한 아이디어,<br/>
                    3D 공간에서 실현하다
                </h1>

                <p className="hero-section__description">
                    실시간 공통 편집 웹 기반 시뮬레이터
                </p>

                <button
                    type="button"
                    className="hero-section__button"
                    onClick={onStartClick}
                >
                    무료로 시작하기
                    <span aria-hidden="true">→</span>
                </button>
            </div>

            <div
                className="hero-section__demo"
                aria-label="제품 데모 영역"
            >
                <span>Visual Demo</span>
            </div>
        </section>
    );
}