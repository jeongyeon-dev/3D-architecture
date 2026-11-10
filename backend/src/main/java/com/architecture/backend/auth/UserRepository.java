package com.architecture.backend.auth;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    Optional<UserEntity> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByNickname(String nickname);

    /* 키워드 기반 유저 검색하기: 최대 10명 */
    @Query("""
        SELECT user
        FROM UserEntity user
        WHERE user.nickname LIKE CONCAT(:keyword, '%')
        ORDER BY user.nickname ASC
    """) 
    List<UserEntity> searchByNickname(@Param("keyword") String keyword, Pageable pageable);
}
