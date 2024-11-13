import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { difficultyTracker } from '../../services/difficultyTracking';
import confetti from 'canvas-confetti';

interface ClassicGameProps {
  onGameEnd: (score: number) => void;
  difficulty: string;
}

interface Question {
  table: number;
  multiplier: number;
  result: number;
}

async function generateQuestion(
  tables: number[],
  previousQuestion?: Question,
  user?: any
): Promise<Question> {
  let newQuestion;
  
  // Récupérer les points faibles de l'utilisateur
  const weakPoints = user ? await difficultyTracker.getWeakPoints(user) : [];
  const probabilities = difficultyTracker.calculateProbability(weakPoints);
  
  // 70% de chance de choisir parmi les points faibles si disponibles
  const useWeakPoint = Math.random() < 0.7 && weakPoints.length > 0;
  
  if (useWeakPoint) {
    // Sélectionner un point faible basé sur les probabilités
    const rand = Math.random();
    let cumSum = 0;
    for (const [key, prob] of probabilities.entries()) {
      cumSum += prob;
      if (rand <= cumSum) {
        const [table, multiplier] = key.split('x').map(Number);
        newQuestion = { table, multiplier, result: table * multiplier };
        break;
      }
    }
  }
  
  // Si pas de point faible ou si on choisit une question aléatoire
  if (!newQuestion) {
    do {
      const table = tables[Math.floor(Math.random() * tables.length)];
      const multiplier = Math.floor(Math.random() * 10) + 1;
      newQuestion = { table, multiplier, result: table * multiplier };
    } while (
      previousQuestion &&
      previousQuestion.table === newQuestion.table &&
      previousQuestion.multiplier === newQuestion.multiplier
    );
  }

  return newQuestion;
}

export function ClassicGame({ onGameEnd, difficulty }: ClassicGameProps) {
  const { selectedTables } = useGame();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => getQuestionTime(difficulty));
  const [stars, setStars] = useState(0);
  const [isAnswerProcessing, setIsAnswerProcessing] = useState(false);
  const [weakPoints, setWeakPoints] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Charger la première question
    generateQuestion(selectedTables, undefined, user).then(question => {
      setCurrentQuestion(question);
    });

    // Charger les points faibles initiaux
    if (user) {
      difficultyTracker.getWeakPoints(user).then(difficulties => {
        setWeakPoints(difficulties.map(d => `${d.table}×${d.multiplier}`));
      });
    }
  }, [selectedTables, user]);

  function getQuestionTime(diff: string) {
    switch (diff) {
      case 'easy': return 20;
      case 'medium': return 15;
      case 'hard': return 10;
      default: return 20;
    }
  }

  // Maintenir le focus sur l'input
  useEffect(() => {
    if (inputRef.current && !isAnswerProcessing) {
      inputRef.current.focus();
    }
  }, [isAnswerProcessing, currentQuestion]);

  // Handle timer
  useEffect(() => {
    if (timeLeft <= 0 && !isAnswerProcessing && currentQuestion) {
      setIsAnswerProcessing(true);
      setFeedback('incorrect');
      setStars(0);
      if (user) {
        difficultyTracker.updateDifficulty(
          user,
          currentQuestion.table,
          currentQuestion.multiplier,
          false
        );
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswerProcessing, currentQuestion, user]);

  // Handle answer processing
  useEffect(() => {
    if (isAnswerProcessing) {
      const timer = setTimeout(async () => {
        setFeedback(null);
        setAnswer('');
        const newQuestion = await generateQuestion(selectedTables, currentQuestion, user);
        setCurrentQuestion(newQuestion);
        setQuestionsAnswered(prev => prev + 1);
        setTimeLeft(getQuestionTime(difficulty));
        setIsAnswerProcessing(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAnswerProcessing, selectedTables, difficulty, currentQuestion, user]);

  // Handle game end
  useEffect(() => {
    if (questionsAnswered >= 10) {
      const finalScore = Math.round((correctAnswers / 10) * 100);
      onGameEnd(finalScore);
    }
  }, [questionsAnswered, correctAnswers, onGameEnd]);

  const handleAnswer = useCallback(async () => {
    if (isAnswerProcessing || !currentQuestion) return;

    const isCorrect = parseInt(answer) === currentQuestion.result;
    setIsAnswerProcessing(true);
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (user) {
      await difficultyTracker.updateDifficulty(
        user,
        currentQuestion.table,
        currentQuestion.multiplier,
        isCorrect
      );

      // Mettre à jour les points faibles
      const updatedWeakPoints = await difficultyTracker.getWeakPoints(user);
      setWeakPoints(updatedWeakPoints.map(d => `${d.table}×${d.multiplier}`));
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      const newStars = Math.min(stars + 1, 5);
      setStars(newStars);

      if (newStars === 5) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } else {
      setStars(0);
    }
  }, [answer, currentQuestion, stars, isAnswerProcessing, user]);

  if (!currentQuestion) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-medium">
            Question {questionsAnswered + 1}/10
          </div>
          <motion.div
            key={timeLeft}
            initial={{ scale: 1 }}
            animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
            className={`text-lg font-medium ${timeLeft <= 5 ? 'text-red-600' : ''}`}
          >
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-600"
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / getQuestionTime(difficulty)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="mt-1 block text-center">{timeLeft}s</span>
          </motion.div>
        </div>

        <div className="text-center space-y-6">
          <motion.div
            key={currentQuestion.table + currentQuestion.multiplier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-bold">
              {currentQuestion.table} × {currentQuestion.multiplier} = ?
            </h2>
            {weakPoints.includes(`${currentQuestion.table}×${currentQuestion.multiplier}`) && (
              <div className="text-sm text-orange-600 bg-orange-50 py-1 px-3 rounded-full inline-block">
                Point à renforcer
              </div>
            )}
          </motion.div>

          <input
            ref={inputRef}
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && answer && handleAnswer()}
            className="text-2xl text-center w-32 p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            disabled={isAnswerProcessing}
          />

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`flex justify-center items-center space-x-2 ${
                  feedback === 'correct' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {feedback === 'correct'
                  ? <Check className="h-6 w-6" />
                  : <X className="h-6 w-6" />
                }
                <span className="font-medium">
                  {feedback === 'correct' ? 'Correct !' : `Incorrect ! La réponse était ${currentQuestion.result}`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium">Série d'étoiles :</span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{ scale: index < stars ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Star
                  className={`h-6 w-6 ${
                    index < stars
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {weakPoints.length > 0 && (
        <div className="bg-orange-50 rounded-xl p-4">
          <h3 className="font-medium text-orange-800 mb-2">Points à renforcer :</h3>
          <div className="flex flex-wrap gap-2">
            {weakPoints.map(point => (
              <span
                key={point}
                className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm"
              >
                {point}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}