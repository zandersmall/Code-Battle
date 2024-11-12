import axios from 'axios';
import { TestResult } from '../types';
import dotenv from 'dotenv';

dotenv.config();

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_API_HOST = 'judge0-ce.p.rapidapi.com';

if (!RAPID_API_KEY) {
  console.error('RAPID_API_KEY is not set in environment variables');
  process.exit(1);
}

export async function runTests(code: string, tests: string[]): Promise<TestResult[]> {
  console.log('Received tests:', tests);
  if (!tests || tests.length === 0) {
    return [{
      passed: false,
      error: 'No test cases provided'
    }];
  }

  const processedCode = code
    .replace('def twoSum(self,', 'def twoSum(')
    .replace('def twoOutOfThree(self,', 'def twoOutOfThree(')
    .replace('def countTriples(self,', 'def countTriples(');

    const wrappedCode = String.raw`import sys
from io import StringIO
from typing import List

# Capture stdout and stderr
class OutputCapture:
    def __init__(self):
        self.stdout = StringIO()
        self.stderr = StringIO()
        self.original_stdout = sys.stdout
        self.original_stderr = sys.stderr

    def __enter__(self):
        sys.stdout = self.stdout
        sys.stderr = self.stderr
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self.original_stdout
        sys.stderr = self.original_stderr

    def get_output(self):
        return self.stdout.getvalue(), self.stderr.getvalue()

${processedCode}

def run_tests():
    results = []
    try:
        import json
        # Run each test case${tests.map((test, index) => `
        try:
            test_code = """${test}"""
            func_call = test_code.split("assert ")[1].split(" ==")[0].strip()
            expected = eval(test_code.split("==")[1].strip())
            
            with OutputCapture() as output:
                try:
                    result = eval(func_call)
                    stdout, stderr = output.get_output()
                    
                    if result == expected:
                        results.append({
                            "passed": True,
                            "output": result,
                            "expected": expected,
                            "stdout": stdout,
                            "stderr": stderr
                        })
                    else:
                        results.append({
                            "passed": False,
                            "error": f"Expected {expected}, but got {result}",
                            "output": result,
                            "expected": expected,
                            "stdout": stdout,
                            "stderr": stderr
                        })
                except Exception as e:
                    stdout, stderr = output.get_output()
                    results.append({
                        "passed": False,
                        "error": f"Runtime Error: {str(e)}",
                        "output": None,
                        "expected": expected,
                        "stdout": stdout,
                        "stderr": stderr
                    })
        except Exception as e:
            results.append({
                "passed": False,
                "error": f"Test Case Error: {str(e)}",
                "output": None,
                "expected": None,
                "stdout": "",
                "stderr": str(e)
            })`).join('\n        ')}
    except Exception as e:
        results.append({
            "passed": False,
            "error": f"Setup Error: {str(e)}",
            "output": None,
            "expected": None,
            "stdout": "",
            "stderr": str(e)
        })
    print(json.dumps(results))

run_tests()`;

  try {
    const response = await axios.post('https://judge0-ce.p.rapidapi.com/submissions', {
      language_id: 71, // Python
      source_code: Buffer.from(wrappedCode).toString('base64'),
      stdin: '',
      wait: true
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
      },
      params: {
        base64_encoded: 'true',
        wait: 'true'
      }
    });

    console.log('Judge0 Response:', {
      status: response.data.status,
      stdout: response.data.stdout ? Buffer.from(response.data.stdout, 'base64').toString() : null,
      stderr: response.data.stderr ? Buffer.from(response.data.stderr, 'base64').toString() : null,
      compile_output: response.data.compile_output ? Buffer.from(response.data.compile_output, 'base64').toString() : null
    });

    if (response.data.status?.id !== 3) { // 3 is "Accepted"
      const error = Buffer.from(
        response.data.stderr || 
        response.data.compile_output || 
        'Execution failed', 
        'base64'
      ).toString();
      
      console.error('Execution failed:', error);
      return [{
        passed: false,
        error: error
      }];
    }

    const output = Buffer.from(response.data.stdout, 'base64').toString();
    try {
      return JSON.parse(output);
    } catch (e) {
      console.error('Failed to parse output:', output);
      return [{
        passed: false,
        error: 'Failed to parse test results'
      }];
    }
  } catch (error: any) {
    console.error('Judge0 error:', error);
    return [{
      passed: false,
      error: error.response?.data?.message || 'Execution error occurred'
    }];
  }
}