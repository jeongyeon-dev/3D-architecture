package com.architecture.backend.auth.jwtUtil;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder refreshJwtDecoder;
    private final long accessTokenMinutes;
    private final long refreshTokenMinutes;

    public JwtService(
        JwtEncoder jwtEncoder,
        @Qualifier("refreshJwtDecoder") JwtDecoder refreshJwtDecoder,
        @Value("${app.jwt.access-token-minutes:60}") long accessTokenMinutes,
        @Value("${app.jwt.refresh-token-minutes:720}") long refreshTokenMinutes
    ) {
        this.jwtEncoder = jwtEncoder;
        this.refreshJwtDecoder = refreshJwtDecoder;
        this.accessTokenMinutes = accessTokenMinutes;
        this.refreshTokenMinutes = refreshTokenMinutes;
    }

    public String createAccessToken(Integer userId, String nickname) {
        Instant issuedAt = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .claim("nickname", nickname)
            .claim("token_type", "access")
            .subject(userId.toString())
            .issuedAt(issuedAt)
            .expiresAt(issuedAt.plus(accessTokenMinutes, ChronoUnit.MINUTES))
            .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public String createRefreshToken(Integer userId, String nickname){
        Instant issuedAt = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .claim("nickname", nickname)
            .claim("token_type", "refresh")
            .subject(userId.toString())
            .issuedAt(issuedAt)
            .expiresAt(issuedAt.plus(refreshTokenMinutes, ChronoUnit.MINUTES))
            .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();      
    }

    public Jwt decodeRefreshToken(String refreshToken) {
        return refreshJwtDecoder.decode(refreshToken);
    }
}
