import { Question } from '@/app/types';

interface ProblemProps {
  problem: Question | null;
}

export default function ProblemDisplay({ problem }: ProblemProps) {
  if (!problem) return null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
      <div className="mb-6 whitespace-pre-wrap">{problem.description}</div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Public Test Cases:</h2>
        <div className="bg-gray-100 p-4 rounded space-y-2">
          {problem.public_tests.map((test, index) => (
            <div key={index} className="font-mono">
              {test.replace('assert ', '').replace(' == ', ' → ')}
            </div>
          ))}
        </div>
      </div>

      <div className="text-gray-600 italic">
        Note: There are additional private test cases that will be used to evaluate your solution.
      </div>
    </div>
  );
}
  