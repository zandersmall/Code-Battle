import { useEffect } from 'react';

interface TimerProps {
  timeLeft: number; // in seconds
}

export default function Timer({ timeLeft }: TimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-center py-2 bg-gray-200">
      <h2 className="text-lg font-semibold">
        Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </h2>
    </div>
  );
}
