import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./AuthModal.css";

export default function AuthModal({ title, onClose, children }) {
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        /* 모달이 열렸을 때 배경 감지를 방지 */
        document.body.style.overflow = "hidden";

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    function handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }

    return createPortal(
        <div
            className="auth-modal__backdrop"
            onMouseDown={handleBackdropClick}
        >
            <section
                className="auth-modal__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
            >
                <button
                    type="button"
                    className="auth-modal__close"
                    onClick={onClose}
                    aria-label="닫기"
                >
                    ×
                </button>

                <h2
                    id="auth-modal-title"
                    className="auth-modal__title"
                >
                    {title}
                </h2>

                {children}
            </section>
        </div>,
        document.body,
    );
}