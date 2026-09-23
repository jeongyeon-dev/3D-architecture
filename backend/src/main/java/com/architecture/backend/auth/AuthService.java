package com.architecture.backend.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.architecture.backend.auth.AuthDtos.LoginResponse;
import com.architecture.backend.auth.AuthDtos.SignupResponse;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public LoginResponse login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || !passwordMatches(rawPassword, user.getPassword())) {
            return new LoginResponse(false, null, null);
        }

        if (!isBcrypt(user.getPassword())) {
            user.changePassword(passwordEncoder.encode(rawPassword));
        }

        return new LoginResponse(true, jwtService.createAccessToken(user.getId()), "bearer");
    }

    @Transactional
    public SignupResponse signup(String username, String nickname, String rawPassword) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        if (userRepository.existsByNickname(nickname)) {
            throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
        }

        User user = userRepository.save(new User(username, nickname, passwordEncoder.encode(rawPassword)));
        return new SignupResponse(user.getId(), user.getUsername(), user.getNickname());
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (isBcrypt(storedPassword)) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return storedPassword.equals(rawPassword);
    }

    private boolean isBcrypt(String password) {
        return password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$");
    }
}
