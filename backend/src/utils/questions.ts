import fs from 'fs';
import path from 'path';
import { Question } from '../types';

export function loadQuestions(): Question[] {
  try {
    const questionsPath = path.join(__dirname, '../../questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf-8');
    const questions = JSON.parse(questionsData);

    // Validate and add IDs if not present
    return questions.map((q: any, index: number) => validateQuestion(q, index));
  } catch (error) {
    console.error('Error loading questions:', error);
    return getDefaultQuestions();
  }
}

function validateQuestion(question: any, index: number): Question {
  return {
    id: question.id || String(index + 1),
    title: question.title || 'Untitled Question',
    description: question.description || '',
    starting_code: question.starting_code || '',
    public_tests: question.public_tests || [],
    private_tests: question.private_tests || []
  };
}

function getDefaultQuestions(): Question[] {
  return [
    {
      id: "1",
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      starting_code: "def twoSum(self, nums: List[int], target: int) -> List[int]:",
      public_tests: ["assert twoSum([2,7,11,15], 9) == [1, 2]"],
      private_tests: ["assert twoSum([3,3], 6) == [1, 2]"]
    }
  ];
}

export function getRandomQuestion(): Question {
  const questions = loadQuestions();
  return questions[Math.floor(Math.random() * questions.length)];
}

export function getQuestionById(id: string): Question | undefined {
  const questions = loadQuestions();
  return questions.find(q => q.id === id);
}

export function getPublicTests(question: Question): string[] {
  return question.public_tests;
}