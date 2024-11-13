import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Check, X } from 'lucide-react';

interface QuizProps {
  onEnd: () => void;
}

export function Quiz({ onEnd }: QuizProps) {
  const { selectedTables, difficulty, setScore, saveGameStats } = useGame();
  const [currentQuestion, setCurrentQuestion] = useState(generateQuestion());
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(getTimeLimit());
  const [startTime, setStartTime] = useState(Date.now());
  const [totalResponseTime, setTotalResponseTime] = useState(0);

  function getTimeLimit() {
    switch (difficulty) {
      case 'easy': return 20;
      case 'medium': return 15;
      case 'hard': return 10;
    }
  }

  function generateQuestion() {
    const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    const multiplier = Math.floor(Math.random() * 10) + 1;
    return { table, multiplier, result: table * multiplier };
  }

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (questionsAnswered < 10) {
      handleAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    if (questionsAnswered === 10) {
      const finalScore = correctAnswers * 10;
      setScore(finalScore);
      
      saveGameStats({
        score: finalScore,
        difficulty,
        tables: selectedTables,
        questionsAnswered,
        correctAnswers,
        averageResponseTime: totalResponseTime / questionsAnswered
      });
      
      setTimeout(onEnd, 2000);
    }
  }, [questionsAnswered]);

  function handleAnswer() {
    const responseTime = (Date.now() - startTime) / 1000;
    setTotalResponseTime(prev => prev + responseTime);
    
    const isCorrect = parseInt(answer) === currentQuestion.result;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) setCorrectAnswers(prev => prev + 1);
    
    setTimeout(() => {
      setFeedback(null);
      setAnswer('');
      setCurrentQuestion(generateQuestion());
      setQuestionsAnswered(prev => prev + 1);
      setTimeLeft(getTimeLimit());
      setStartTime(Date.now());
    }, 1000);
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-medium">
            Question {questionsAnswered + 1}/10
          </div>
          <div className="text-lg font-medium">
            Temps: {timeLeft}s
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">
            {currentQuestion.table} × {currentQuestion.multiplier} = ?
          </h2>

          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && answer && handleAnswer()}
            className="text-2xl text-center w-32 p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            autoFocus
          />

          {feedback && (
            <div className={`flex justify-center items-center space-x-2 ${
              feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback === 'correct' 
                ? <Check className="h-6 w-6" />
                : <X className="h-6 w-6" />
              }
              <span className="font-medium">
                {feedback === 'correct' ? 'Correct !' : `Incorrect ! La réponse était ${currentQuestion.result}`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium">Score :</span>
          <span className="text-lg font-bold text-purple-600">
            {correctAnswers * 10}%
          </span>
        </div>
      </div>
    </div>
  );
}