'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function JoinCompetition() {
  const router = useRouter();
  const params = useParams();
  const competitionId = params.id as string;
  const [username, setUsername] = useState('');

  const handleJoin = () => {
    if (username.trim()) {
      router.push(`/competition/${competitionId}/race?username=${encodeURIComponent(username)}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Join Competition</h1>
        <input
          type="text"
          placeholder="Enter your username"
          className="w-full px-4 py-2 border rounded-md mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
        />
        <button
          onClick={handleJoin}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Join
        </button>
      </div>
    </div>
  );
}