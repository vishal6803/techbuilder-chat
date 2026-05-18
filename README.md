# Real-Time Chat API

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and add your MongoDB URI:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/techbuilderchat
```

Use **`.env`** for real values — the app does not load `.env.example`.

Start MongoDB (local or Atlas), then:

```bash
npm start
```

Base URL: `http://localhost:3000` (or your `PORT` from `.env`).

---

## How to test (step by step)

Run these after `npm start`. Replace `ROOM_ID`, `ALICE_USER_ID`, and `BOB_USER_ID` with ids from the responses.

**1. Health check**

```bash
curl.exe http://localhost:3000/
```

**2. Register users**

```bash
curl.exe -X POST http://localhost:3000/users/register -H "Content-Type: application/json" -d "{\"name\":\"Alice\",\"email\":\"alice@test.com\"}"

curl.exe -X POST http://localhost:3000/users/register -H "Content-Type: application/json" -d "{\"name\":\"Bob\",\"email\":\"bob@test.com\"}"
```

**3. Create room**

```bash
curl.exe -X POST http://localhost:3000/rooms/create -H "Content-Type: application/json" -d "{\"name\":\"General\"}"
```

**4. List rooms**

```bash
curl.exe http://localhost:3000/rooms
```

**5. Messages (empty before chat)**

```bash
curl.exe http://localhost:3000/messages/ROOM_ID
```

**6. Socket chat — two terminals**

```bash
node test-chat.js ROOM_ID ALICE_USER_ID Alice
```

```bash
node test-chat.js ROOM_ID BOB_USER_ID Bob
```

**7. Messages after chat (pagination + search)**

```bash
curl.exe "http://localhost:3000/messages/ROOM_ID?page=1&limit=10"

curl.exe "http://localhost:3000/messages/ROOM_ID?search=Alice"
```

---

## Notes

- Windows: use `curl.exe`, not PowerShell's `curl`.
- If you change `PORT` in `.env`, update the URLs above to match.
- `test-chat.js` reads `PORT` from `.env` automatically.
