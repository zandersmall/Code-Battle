'use client';

import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const router = useRouter();

  const handleNewCompetition = () => {
    // Generate a unique competition ID
    const competitionId = uuidv4();
    // Redirect to the competition join page
    router.push(`/competition/${competitionId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Welcome to Coding Racer</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Compete with other developers in real-time coding challenges!
      </p>
      <button
        onClick={handleNewCompetition}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Start New Competition
      </button>
    </div>
  );
}
