package com.architecture.backend.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.architecture.backend.auth.AuthDtos.LoginRequest;
import com.architecture.backend.auth.AuthDtos.LoginResponse;
import com.architecture.backend.auth.AuthDtos.SignupRequest;
import com.architecture.backend.auth.AuthDtos.SignupResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.username(), request.password());
    }

    @PostMapping("/signup")
    SignupResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request.username(), request.nickname(), request.password());
    }
}
