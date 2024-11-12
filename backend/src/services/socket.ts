import { Server, Socket } from 'socket.io';
import { Competition, CompetitionUser } from '../types';
import { loadQuestions } from '../utils/questions';
import { RACE_DURATION, COUNTDOWN_DURATION } from '../config/constants';
import { runTests } from './judge0';

const competitions = new Map<string, Competition>();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    socket.on('joinCompetition', handleJoinCompetition(io, socket));
    socket.on('codeChange', handleCodeChange(socket));
    socket.on('disconnect', handleDisconnect(socket));
    socket.on('submitCode', handleSubmitCode(io, socket));
  });
}
const handleSubmitCode = (io: Server, socket: Socket) => 
    async ({ competitionId, code }: { competitionId: string; code: string }) => {
      const competition = competitions.get(competitionId);
      if (!competition || !competition.problem) return;
  
      const user = competition.users.find(u => u.socketId === socket.id);
      if (!user) return;
  
      // Run tests
      const testResults = await runTests(code, [
        ...competition.problem.public_tests,
        ...competition.problem.private_tests
      ]);
  
      // Update user's results
      user.testResults = testResults;
  
      // Check if all tests passed
      const allPassed = testResults.every(result => result.passed);
      if (allPassed) {
        io.to(competitionId).emit('raceEnd', { 
          winner: user.username,
          reason: 'solution'
        });
        competitions.delete(competitionId);
      } else {
        // Send results only to the user who submitted
        socket.emit('testResults', { results: testResults });
      }
    };
const handleJoinCompetition = (io: Server, socket: Socket) => 
  async ({ competitionId, username }: { competitionId: string; username: string }) => {
    if (!competitions.has(competitionId)) {
      competitions.set(competitionId, {
        users: [],
        problem: null,
        started: false
      });
    }

    const competition = competitions.get(competitionId)!;
    
    if (competition.users.length < 2) {
      const user: CompetitionUser = { username, socketId: socket.id };
      competition.users.push(user);
      socket.join(competitionId);

      if (competition.users.length === 2) {
        io.to(competitionId).emit('bothPlayersJoined', {
          users: competition.users.map(u => ({ username: u.username }))
        });
        
        // Start countdown
        setTimeout(() => {
          startCompetition(io, competitionId);
        }, COUNTDOWN_DURATION);
      }
    }
  };

const handleCodeChange = (socket: Socket) => 
  ({ competitionId, code }: { competitionId: string; code: string }) => {
    socket.to(competitionId).emit('codeChange', { code });
  };

const handleDisconnect = (socket: Socket) => () => {
  // Handle user disconnection, we can add later
};

function startCompetition(io: Server, competitionId: string) {
  const competition = competitions.get(competitionId)!;
  const questions = loadQuestions();
  competition.problem = questions[Math.floor(Math.random() * questions.length)];

  // Start countdown
  io.to(competitionId).emit('startCountdown');
  
  setTimeout(() => {
    competition.started = true;
    io.to(competitionId).emit('startRace', { problem: competition.problem });
    
    // Start timer
    let timeLeft = RACE_DURATION;
    const timer = setInterval(() => {
      timeLeft--;
      competition.timeLeft = timeLeft;
      io.to(competitionId).emit('timerUpdate', { timeLeft });
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        io.to(competitionId).emit('raceEnd', { reason: 'timeout' });
        competitions.delete(competitionId);
      }
    }, 1000);
  }, COUNTDOWN_DURATION * 1000);
}