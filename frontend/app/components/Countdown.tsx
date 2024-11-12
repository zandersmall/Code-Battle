import { useEffect, useState } from 'react';

interface CountdownProps {
  onComplete: () => void;
}

export default function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        Both players have joined!
      </h2>
      <div className="relative">
        <div className="text-6xl font-bold text-blue-600">
          {count}
        </div>
        <div 
          className="absolute inset-0 animate-ping"
          style={{
            animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
            opacity: count === 5 ? 0 : 1
          }}
        >
          <div className="text-6xl font-bold text-blue-600/75">
            {count}
          </div>
        </div>
      </div>
      <p className="mt-8 text-gray-600">
        Game starting in...
      </p>
    </div>
  );
}