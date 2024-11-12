import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';

interface WinnerAnnouncementProps {
  winner: string;
  isWinner: boolean;
  timeElapsed: number;
}

export default function WinnerAnnouncement({ winner, isWinner, timeElapsed }: WinnerAnnouncementProps) {
  const router = useRouter();

  const handlePlayAgain = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
        {isWinner && <Confetti />}
        
        <h2 className={`text-3xl font-bold mb-4 ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
          {isWinner ? (
            'You Won! 🎉'
          ) : (
            `${winner} won! 😔`
          )}
        </h2>

        <button
          onClick={handlePlayAgain}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}