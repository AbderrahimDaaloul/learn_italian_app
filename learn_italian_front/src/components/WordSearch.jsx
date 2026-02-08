import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  ArrowRightLeft,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const API_URL = "/api/words";

export default function WordSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState("en-to-it"); // "en-to-it" or "it-to-en"
  const [allWords, setAllWords] = useState([]);

  // Fetch all words on component mount
  const fetchAllWords = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch words");
      const data = await response.json();
      setAllWords(data);
    } catch (err) {
      console.error("Error fetching words:", err);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      // Fetch all words if not already fetched
      if (allWords.length === 0) {
        await fetchAllWords();
      }

      const query = searchQuery.trim().toLowerCase();
      let results = [];

      if (searchMode === "en-to-it") {
        // Search English to Italian
        results = allWords.filter((word) =>
          word.english_word.toLowerCase().includes(query)
        );
      } else {
        // Search Italian to English
        results = allWords.filter((word) =>
          word.italian_word.toLowerCase().includes(query)
        );
      }

      setSearchResults({
        mode: searchMode,
        query: searchQuery,
        results: results,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSearchMode = () => {
    setSearchMode(searchMode === "en-to-it" ? "it-to-en" : "en-to-it");
    setSearchResults(null);
    setSearchQuery("");
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-4xl mx-auto mb-6"
    >
      {/* Search Card */}
      <div className="bg-gradient-to-br from-slate-900/80 via-purple-900/40 to-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/20 p-4 sm:p-6 border border-purple-400/20">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Cerca Parola
          </h2>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Input and Mode Toggle */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchMode === "en-to-it"
                    ? "Scrivi una parola inglese..."
                    : "Scrivi una parola italiana..."
                }
                className="w-full px-4 py-3 sm:py-3 bg-slate-800/50 border-2 border-purple-500/40 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-slate-500 text-sm sm:text-base"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
            </div>

            {/* Mode Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={toggleSearchMode}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap text-sm sm:text-base"
            >
              <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">
                {searchMode === "en-to-it" ? "EN → IT" : "IT → EN"}
              </span>
              <span className="sm:hidden">
                {searchMode === "en-to-it" ? "EN" : "IT"}
              </span>
            </motion.button>

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="hidden sm:inline">Cerca</span>
            </motion.button>
          </div>

          {/* Search Mode Indicator */}
          <div className="text-xs sm:text-sm text-gray-400">
            {searchMode === "en-to-it"
              ? "Cercando da Inglese → Italiano"
              : "Cercando da Italiano → Inglese"}
          </div>
        </form>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="mt-4 p-3 sm:p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm sm:text-base">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 max-h-96 overflow-y-auto"
            >
              {searchResults.results.length > 0 ? (
                <>
                  <p className="text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    {searchResults.results.length}{" "}
                    {searchResults.results.length === 1 ? "risultato" : "risultati"}
                  </p>
                  {searchResults.results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-3 sm:p-4 rounded-xl border border-purple-400/30 hover:border-purple-400/60 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-500/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm sm:text-base">
                            {result.italian_word}
                          </p>
                          <p className="text-gray-400 text-xs sm:text-sm">
                            {result.english_word}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="inline-block px-2 sm:px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-400/40">
                            <p className="text-xs sm:text-sm text-purple-300 font-semibold">
                              {searchResults.mode === "en-to-it"
                                ? "IT"
                                : "EN"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6 sm:py-8"
                >
                  <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-400 text-sm sm:text-base">
                    Nessuna parola trovata per "{searchResults.query}"
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
