export interface Question {
    id?: string;
    title: string;
    description: string;
    starting_code: string;
    public_tests: string[];
    private_tests: string[];
  }
  
  export interface TestResult {
    passed: boolean;
    error?: string;
    output?: any;
  }
  
  export interface Competition {
    users: CompetitionUser[];
    problem: Question | null;
    started: boolean;
    timeLeft?: number;
  }
  
  export interface CompetitionUser {
    username: string;
    socketId: string;
    code?: string;
    testResults?: TestResult[];
  }