# TODO + PostgreSQL

Node.js(Express)와 PostgreSQL로 만든 간단한 TODO 앱입니다.

## 실행

```bash
npm install
cp .env.example .env
# PostgreSQL이 실행 중인 상태에서
npm start
```

브라우저에서 http://localhost:3000 을 엽니다. PostgreSQL까지 한 번에 실행하려면:

```bash
docker compose up --build
```

## API

- `GET /api/todos` — 목록 조회
- `POST /api/todos` — `{ "title": "..." }` 생성
- `PATCH /api/todos/:id` — `{ "completed": true }` 완료 상태 변경
- `DELETE /api/todos/:id` — 삭제
- `GET /api/health` — 앱/DB 상태 확인
