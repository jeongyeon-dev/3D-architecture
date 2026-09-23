# Architecture Backend

Spring Boot와 Gradle 기반의 API 서버입니다. 기존 FastAPI와 동일하게 기본 포트 8000에서 실행됩니다.

## 요구 사항

- Java 21
- PostgreSQL

## 환경 변수

`backend/.env.example`을 `backend/.env`로 복사한 뒤 로컬 값을 입력합니다. `.env`는 Git에서 제외됩니다.

```properties
SECRET_KEY=replace-with-at-least-32-random-bytes
DB_URL=jdbc:postgresql://localhost:5432/architecture
DB_USERNAME=postgres
DB_PASSWORD=replace-with-your-local-password
ACCESS_TOKEN_EXPIRE_MINUTES=60
SERVER_PORT=8000
```

## 실행

Windows:

```powershell
.\gradlew.bat bootRun
```

macOS/Linux:

```bash
./gradlew bootRun
```

## 테스트

```powershell
.\gradlew.bat test
```

## 데이터베이스

Flyway가 스키마 변경을 관리합니다. 기존 Alembic 데이터베이스는 최초 실행 시 버전 1로 baseline 처리하며, 기존 테이블과 데이터는 유지됩니다.
