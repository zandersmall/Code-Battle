import { TestResult } from '../types';

interface ResultsProps {
  results: TestResult[];
  publicTestCount: number;
}

export default function Results({ results, publicTestCount }: ResultsProps) {
  if (!results.length) {
    return (
      <div className="p-4 border-t">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Results</h2>
        <p className="text-gray-600">No results yet. Submit your code to see results.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">Results</h2>
      <div className="space-y-4">
        {results.map((result, index) => {
          const isPublicTest = index < publicTestCount;
          
          return (
            <div 
              key={index}
              className={`p-4 rounded-lg ${
                result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              {/* Test Header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`flex items-center gap-2 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                  <span className="text-lg">
                    {result.passed ? '✓' : '✗'}
                  </span>
                  <span className="font-medium">
                    {isPublicTest ? 'Public' : 'Private'} Test {index + 1}
                  </span>
                </span>
                <span className={`text-sm font-medium ${
                  result.passed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.passed ? 'Passed' : 'Failed'}
                </span>
              </div>

              {/* Test Details */}
              {isPublicTest && (
                <div className="space-y-2 mt-2">
                  {/* Result Output */}
                  <div className="text-sm">
                    <div className="font-medium text-gray-700">Output:</div>
                    <div className="bg-white/50 p-2 rounded font-mono">
                      {result.output !== null ? JSON.stringify(result.output) : 'No output'}
                    </div>
                  </div>

                  {/* Expected Value */}
                  <div className="text-sm">
                    <div className="font-medium text-gray-700">Expected:</div>
                    <div className="bg-white/50 p-2 rounded font-mono">
                      {result.expected !== null ? JSON.stringify(result.expected) : 'No expected value'}
                    </div>
                  </div>

                  {/* Console Output */}
                  {(result.stdout || result.stderr) && (
                    <div className="text-sm">
                      <div className="font-medium text-gray-700">Console:</div>
                      {result.stdout && (
                        <div className="bg-white/50 p-2 rounded font-mono whitespace-pre-wrap">
                          {result.stdout}
                        </div>
                      )}
                      {result.stderr && (
                        <div className="bg-red-100/50 p-2 rounded font-mono whitespace-pre-wrap text-red-600">
                          {result.stderr}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {!result.passed && result.error && (
                    <div className="text-sm">
                      <div className="font-medium text-red-600">Error:</div>
                      <div className="bg-red-100/50 p-2 rounded font-mono">
                        {result.error}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Private Test Failure Message */}
              {!isPublicTest && !result.passed && (
                <div className="text-sm text-red-600 mt-2">
                  Private test case failed
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}