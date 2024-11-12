Time taken: I began development at 1:00 pm CST and wrapped up by 3:30 pm CST


## My approach: ##

**Frontend (Next.js)**: Built with Next.js and styled with Tailwind CSS. I used the Monaco Editor for Python syntax highlighting, handling real-time updates through Socket.IO. The main RacePage component manages game state and socket events in a structured, easy-to-read setup.

**Backend (Node.js)**: The backend uses Socket.IO for real-time communication and the Judge0 API for code execution. I structured socket events into separate functions, simplifying maintenance. Game state is stored in memory, efficient for an MVP but easily adaptable for persistence if needed.

*Some notes:*
1. I used Socket.IO for isolated rooms for each of the matches. My goal was to keep games seperate and as lag-free as possible.

2. For code execution, I used Judge0. Judge0 executes all code in a sandboxed enviroment, so it's pretty secure. It also has output capture and error handling which I like.

3. I used React hooks and kept states local and as straightforward as possible (Trying to keep this simple as it's just a takehome).

If it was specified/I had more time, this needs error handling for disconnects, persistent storage features, and more test coverage.


## How to run ##

Install dependencies:
```
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

Run the dev server:
```
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

Open **http://localhost:3000** and start a new competition. Then open another tab in incognito mode and do the same.


## HUGE NOTE: I included the .env files for both the frontend and backend and pushed these to the repo. This is EXTREMELY unsecure and I'd never do this in a real project, but it keeps things simple for the takehome. ##
