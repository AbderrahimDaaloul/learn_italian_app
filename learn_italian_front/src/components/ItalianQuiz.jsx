import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Trophy,
  RotateCw,
  HelpCircle,
  Sparkles,
  Volume2,
  Award,
  TrendingUp,
  Lightbulb,
  Plus,
  Loader2,
} from "lucide-react";

const API_URL = "/api/words";

export default function ItalianQuiz() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null);
  const [shuffledWords, setShuffledWords] = useState([]);

  // Add word modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItalianWord, setNewItalianWord] = useState("");
  const [newEnglishWord, setNewEnglishWord] = useState("");
  const [addingWord, setAddingWord] = useState(false);
  const [addError, setAddError] = useState(null);

  // Fetch words from API
  const fetchWords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch words");
      }
      const data = await response.json();
      // Transform API data to [italian_word, english_word] format
      const transformedWords = data.map((item) => [
        item.italian_word,
        item.english_word,
      ]);
      setWords(transformedWords);
      // Shuffle words
      const shuffled = [...transformedWords].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new word to API
  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newItalianWord.trim() || !newEnglishWord.trim()) return;

    try {
      setAddingWord(true);
      setAddError(null);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          italian_word: newItalianWord.trim(),
          english_word: newEnglishWord.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add word");
      }

      // Reset form and close modal
      setNewItalianWord("");
      setNewEnglishWord("");
      setShowAddModal(false);

      // Refresh words list
      await fetchWords();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddingWord(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const currentWord = shuffledWords[currentIndex] || words[currentIndex];
  const [italianWord, englishMeaning] = currentWord || [];

  const handleSubmit = (e) => {
    e.preventDefault();

    const userAnswer = userInput.trim().toLowerCase();
    const correctAnswer = italianWord.toLowerCase();

    if (userAnswer === correctAnswer) {
      // Correct answer
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setShowFeedback("correct");

      setTimeout(() => {
        setShowFeedback(null);
        moveToNextWord();
      }, 1500);
    } else {
      // Wrong answer
      setStreak(0);
      if (attempts < 1) {
        setAttempts(attempts + 1);
        setUserInput("");
        setShowFeedback("incorrect");
        setTimeout(() => setShowFeedback(null), 1000);
      } else {
        setShowAnswer(true);
        setShowFeedback("failed");
      }
    }
  };

  const moveToNextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setAttempts(0);
      setShowAnswer(false);
      setShowFeedback(null);
    } else {
      setCompleted(true);
    }
  };

  const handleContinue = () => {
    moveToNextWord();
  };

  const handleRestart = async () => {
    await fetchWords();
    setCurrentIndex(0);
    setUserInput("");
    setAttempts(0);
    setShowAnswer(false);
    setScore(0);
    setStreak(0);
    setCompleted(false);
  };

  const handleHint = () => {
    const hint = italianWord.substring(0, Math.ceil(italianWord.length / 2));
    setUserInput(hint + "_".repeat(italianWord.length - hint.length));
  };

  const speakWord = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(italianWord);
      utterance.lang = "it-IT";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200 text-lg">Caricamento parole...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 p-8 rounded-2xl border border-red-500/30 text-center max-w-md"
        >
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Errore di connessione
          </h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchWords}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-xl transition-all"
          >
            Riprova
          </button>
        </motion.div>
      </div>
    );
  }

  // No words state
  if (words.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 p-8 rounded-2xl border border-purple-500/30 text-center max-w-md"
        >
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Nessuna parola trovata
          </h2>
          <p className="text-gray-400 mb-4">
            Aggiungi alcune parole per iniziare!
          </p>
        </motion.div>

        {/* Add Word Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 p-6 rounded-2xl border border-purple-500/30 w-full max-w-md"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-green-400" />
                  Aggiungi Nuova Parola
                </h3>

                <form onSubmit={handleAddWord} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Parola Italiana
                    </label>
                    <input
                      type="text"
                      value={newItalianWord}
                      onChange={(e) => setNewItalianWord(e.target.value)}
                      placeholder="es. ciao"
                      className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500/40 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-slate-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Parola Inglese
                    </label>
                    <input
                      type="text"
                      value={newEnglishWord}
                      onChange={(e) => setNewEnglishWord(e.target.value)}
                      placeholder="es. hello"
                      className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500/40 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-slate-500"
                    />
                  </div>

                  {addError && (
                    <p className="text-red-400 text-sm">{addError}</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      disabled={
                        addingWord ||
                        !newItalianWord.trim() ||
                        !newEnglishWord.trim()
                      }
                      className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addingWord ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Aggiungi
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / words.length) * 100);

    return (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-purple-500/20"
        >
          <div className="relative mb-4 sm:mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-xl opacity-20"
            />
            <div className="relative text-center">
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto text-yellow-400" />
              <Sparkles className="absolute top-0 right-1/4 w-4 h-4 sm:w-6 sm:h-6 text-yellow-300 animate-pulse" />
            </div>
          </div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white mb-1 sm:mb-2"
          >
            Complimenti! 🎉
          </motion.h2>
          <p className="text-purple-200 text-center mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
            Hai completato la sfida di vocabolario italiano!
          </p>

          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-400/30 hover:border-blue-400/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {score}/{words.length}
                  </p>
                  <p className="text-blue-300 text-xs sm:text-sm">
                    Punteggio Finale
                  </p>
                </div>
                <Award className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-green-600/20 to-teal-600/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-green-400/30 hover:border-green-400/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {percentage}%
                  </p>
                  <p className="text-green-300 text-xs sm:text-sm">
                    Precisione
                  </p>
                </div>
                <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-400" />
              </div>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRestart}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
            Ricomincia la Sfida
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-lg"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 800),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 600),
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              y: [null, -40, 40, -30, 30, -15],
              x: [null, 30, -30, 15, -15, 0],
              opacity: [null, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl flex-shrink-0">
        {/* Add Word Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 p-6 rounded-2xl border border-purple-500/30 w-full max-w-md"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-green-400" />
                  Aggiungi Nuova Parola
                </h3>

                <form onSubmit={handleAddWord} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Parola Italiana
                    </label>
                    <input
                      type="text"
                      value={newItalianWord}
                      onChange={(e) => setNewItalianWord(e.target.value)}
                      placeholder="es. ciao"
                      className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500/40 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-slate-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Parola Inglese
                    </label>
                    <input
                      type="text"
                      value={newEnglishWord}
                      onChange={(e) => setNewEnglishWord(e.target.value)}
                      placeholder="es. hello"
                      className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500/40 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-slate-500"
                    />
                  </div>

                  {addError && (
                    <p className="text-red-400 text-sm">{addError}</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      disabled={
                        addingWord ||
                        !newItalianWord.trim() ||
                        !newEnglishWord.trim()
                      }
                      className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addingWord ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Aggiungi
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-4 sm:mb-6"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="drop-shadow-lg"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50" />
            </motion.div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Parole Italiane
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Impara il vocabolario italiano in modo divertente
          </p>

         
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 sm:mb-6 bg-slate-800/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-400/20 shadow-lg shadow-purple-500/10"
        >
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-white">
                {currentIndex + 1}/{words.length}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">Progresso</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-green-400">
                {score}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">Punteggio</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-yellow-400">
                {streak}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">Streak</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-blue-400">
                {Math.round((score / (currentIndex + 1)) * 100) || 0}%
              </p>
              <p className="text-xs sm:text-sm text-gray-400">Precisione</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between mb-1 sm:mb-2 text-xs sm:text-sm">
            <span className="text-gray-400">Progresso</span>
            <span className="text-gray-400">
              {Math.round(((currentIndex + 1) / words.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 sm:h-3 bg-slate-800/50 rounded-full overflow-hidden border border-purple-400/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / words.length) * 100}%`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Main Quiz Card */}
        <motion.div
          key={currentIndex}
          initial={{ x: 100, opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -100, opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-br from-slate-900/80 via-purple-900/40 to-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/20 p-4 sm:p-6 md:p-8 border border-purple-400/20 mb-4 sm:mb-6"
        >
          {/* Question Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Traduci in italiano
              </span>
            </div>
            <div className="flex gap-5">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Aggiungi Parola
              </button>
              <button
                onClick={speakWord}
                className="p-1.5 sm:p-2 hover:bg-blue-500/20 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </button>
            </div>
          </div>

          {/* Question */}
          <div className="mb-4 sm:mb-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-400/40 shadow-xl shadow-blue-500/10"
            >
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white mb-1 sm:mb-2">
                {englishMeaning}
              </p>
              <p className="text-center text-gray-400 text-xs sm:text-sm">
                Scritto in inglese
              </p>
            </motion.div>
          </div>

          {/* Feedback Animation */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
                  showFeedback === "correct"
                    ? "bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/20"
                    : "bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/20"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  {showFeedback === "correct" ? (
                    <>
                      <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                      <div>
                        <p className="font-bold text-green-400 text-sm sm:text-base">
                          Esatto! 🎉
                        </p>
                        <p className="text-xs sm:text-sm text-green-300">
                          Continua così! Streak: {streak}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                      <div>
                        <p className="font-bold text-red-400 text-sm sm:text-base">
                          Quasi... Riprova!
                        </p>
                        <p className="text-xs sm:text-sm text-red-300">
                          Hai ancora {2 - attempts} tentativo
                          {attempts === 0 ? "i" : "o"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer Display */}
          {showAnswer && (
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="mb-4 sm:mb-6 bg-gradient-to-r from-red-900/30 to-orange-900/30 p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-red-500/50 shadow-lg shadow-red-500/20"
            >
              <p className="text-xs sm:text-sm font-semibold text-red-400 mb-1 sm:mb-2">
                La risposta corretta è:
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-300">
                {italianWord}
              </p>
            </motion.div>
          )}

          {/* Input Form */}
          {!showAnswer ? (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Scrivi la parola italiana..."
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/50 border-2 border-blue-500/40 rounded-xl sm:rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 text-base sm:text-lg text-white placeholder-slate-500 shadow-lg shadow-blue-500/10"
                  autoFocus
                />
                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    type="button"
                    onClick={handleHint}
                    className="p-1.5 sm:p-2 hover:bg-gray-700/50 rounded-full transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </button>
                </div>
              </motion.div>

              <div className="flex gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:shadow-xl shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm sm:text-base"
                  disabled={!userInput.trim()}
                >
                  Verifica Risposta
                </motion.button>
              </div>
            </form>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:shadow-xl shadow-green-500/30 transition-all duration-300 text-sm sm:text-base"
            >
              Prossima Parola →
            </motion.button>
          )}
        </motion.div>

        {/* Attempts Indicator */}
        <div className="flex justify-center gap-2 mb-4 sm:mb-6">
          {[1, 2].map((attempt) => (
            <div
              key={attempt}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                attempt <= 2 - attempts ? "bg-blue-500" : "bg-red-500/30"
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center pb-4"
        >
          <p className="text-gray-500 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Impara ogni giorno nuove parole!
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          </p>
        </motion.div>
      </div>
    </div>
  );
}
