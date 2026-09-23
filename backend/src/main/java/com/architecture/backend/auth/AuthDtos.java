package com.architecture.backend.auth;

import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
        @NotBlank(message = "아이디를 입력해 주세요.") String username,
        @NotBlank(message = "비밀번호를 입력해 주세요.") String password
    ) {
    }

    public record LoginResponse(boolean success, String accessToken, String tokenType) {
    }

    public record SignupRequest(
        @NotBlank(message = "아이디를 입력해 주세요.") String username,
        @NotBlank(message = "닉네임을 입력해 주세요.") String nickname,
        @NotBlank(message = "비밀번호를 입력해 주세요.") String password
    ) {
    }

    public record SignupResponse(Integer id, String username, String nickname) {
    }
}
