'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import CodeEditor from '@/app/components/CodeEditor';
import ProblemDisplay from '@/app/components/ProblemDisplay';
import Timer from '@/app/components/Timer';
import Results from '@/app/components/Results';
import Countdown from '@/app/components/Countdown';
import { Question, TestResult } from '@/app/types';
import WinnerAnnouncement from '@/app/components/WinnerAnnouncement';

let socket: Socket;

export default function RacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const competitionId = params.id as string;
  const username = searchParams.get('username');
  
  const [opponentCode, setOpponentCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [problem, setProblem] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [raceStarted, setRaceStarted] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [publicTestCount, setPublicTestCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [bothPlayersJoined, setBothPlayersJoined] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);

  useEffect(() => {
    if (!competitionId || !username) return;

    socket = io('http://localhost:3001');
    socket.emit('joinCompetition', { competitionId, username });

    socket.on('bothPlayersJoined', (data: { users: { username: string }[] }) => {
      console.log('Both players joined', data);
      setBothPlayersJoined(true);
      setIsCountingDown(true);
      const opponentUser = data.users.find(user => user.username !== username);
      if (opponentUser) {
        setOpponent(opponentUser.username);
      }
    });

    socket.on('startCountdown', () => {
      setIsCountingDown(true);
    });

    socket.on('startRace', (data) => {
      setProblem(data.problem);
      setUserCode(data.problem.starting_code);
      setPublicTestCount(data.problem.public_tests.length);
      setRaceStarted(true);
      setIsCountingDown(false);
      setRaceStartTime(Date.now());
    });

    socket.on('codeChange', (data) => {
      setOpponentCode(data.code);
    });

    socket.on('timerUpdate', (data) => {
      setTimeLeft(data.timeLeft);
    });

    socket.on('testResults', (data) => {
      setTestResults(data.results);
    });

    socket.on('raceEnd', (data) => {
      const timeElapsed = Math.floor((Date.now() - (raceStartTime || 0)) / 1000);
      setTimeElapsed(timeElapsed);
      setWinner(data.winner);
    });

    return () => {
      socket?.disconnect();
    };
  }, [competitionId, username]);

  const handleCodeChange = (newCode: string) => {
    setUserCode(newCode);
    socket?.emit('codeChange', { competitionId, code: newCode });
  };

  const handleSubmit = () => {
    socket?.emit('submitCode', { competitionId, code: userCode });
  };

  // Function to handle URL copying
  const handleCopyUrl = async () => {
    try {
      // Get the current URL and create a URL object
      const currentUrl = new URL(window.location.href);
      
      // Remove the username query parameter
      currentUrl.searchParams.delete('username');
      
      // Remove the '/race' segment from the pathname
      const pathParts = currentUrl.pathname.split('/');
      pathParts.pop(); // Remove 'race'
      currentUrl.pathname = pathParts.join('/');
      
      // Get the clean URL string
      const cleanUrl = currentUrl.toString();
      
      // Copy to clipboard
      await navigator.clipboard.writeText(cleanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (!competitionId || !username) {
    return <div>Invalid competition or username</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <Timer timeLeft={timeLeft} />
        <div className="border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-12">
            {/* Player Card */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-lg text-gray-900">{username}</span>
              </div>
              <span className="text-sm text-gray-500">You</span>
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 rounded-full p-4">
                <span className="text-3xl font-bold text-gray-400">VS</span>
              </div>
            </div>

            {/* Opponent Card */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-semibold text-lg text-gray-900">
                  {opponent || 'Waiting...'}
                </span>
              </div>
              <span className="text-sm text-gray-500">Opponent</span>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="max-w-4xl mx-auto mt-4 flex justify-between px-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tests Passed:</span>
              <span className="font-medium text-green-600">
                {testResults.filter(r => r.passed).length}/{testResults.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Time Elapsed:</span>
              <span className="font-medium text-blue-600">
                {Math.floor((Date.now() - (raceStartTime || Date.now())) / 1000)}s
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {raceStarted ? (
        <div className="flex-grow grid grid-cols-2 gap-4 p-4">
          <div className="space-y-4">
            <ProblemDisplay problem={problem} />
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Your Code</h2>
              <CodeEditor 
                code={userCode} 
                onChange={handleCodeChange} 
              />
              <button
                onClick={handleSubmit}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Solution
              </button>
              <Results results={testResults} publicTestCount={publicTestCount} />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Opponent's Code</h2>
              <CodeEditor 
                code={opponentCode} 
                onChange={() => {}} 
                readOnly={true}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center bg-white">
          {isCountingDown ? (
            <Countdown onComplete={() => {}} />
          ) : (
            <div className="text-center p-8 max-w-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {bothPlayersJoined 
                  ? "Both players have joined!"
                  : "Waiting for opponent..."}
              </h2>
              {!bothPlayersJoined && (
                <>
                  <p className="text-gray-600 mb-6">
                    Share this URL with another person to start the competition
                  </p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <input
                      type="text"
                      readOnly
                      value={window.location.href}
                      className="flex-1 p-2 border rounded bg-gray-50 text-sm font-mono"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        copied 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copied ? (
                        <span className="flex items-center gap-2">
                          <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M5 13l4 4L19 7" 
                            />
                          </svg>
                          Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                            />
                          </svg>
                          Copy URL
                        </span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {winner && (
        <WinnerAnnouncement
          winner={winner}
          isWinner={winner === username}
          timeElapsed={timeElapsed}
        />
      )}
    </div>
  );
}