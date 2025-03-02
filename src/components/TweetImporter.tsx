import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, Check, Loader } from 'lucide-react';
import { Tweet } from '../types';
import { parseImportedData, detectImportFormat } from '../lib/tweet-parser';
import { useToast } from './Toast';

interface TweetImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (tweets: Tweet[]) => void;
}

export function TweetImporter({ isOpen, onClose, onImportComplete }: TweetImporterProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [importMethod, setImportMethod] = useState<'file' | 'paste' | null>(null);
  const [importData, setImportData] = useState<string>('');
  const [parsedTweets, setParsedTweets] = useState<Tweet[]>([]);
  const [selectedTweets, setSelectedTweets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Reset state when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      setStep('upload');
      setImportMethod(null);
      setImportData('');
      setParsedTweets([]);
      setSelectedTweets(new Set());
      setLoading(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setImportData(content);
        
        // Try to detect format and parse
        const format = detectImportFormat(content);
        if (format === 'unknown') {
          throw new Error('Unsupported file format. Please use JSON, CSV, or Markdown.');
        }
        
        const tweets = parseImportedData(content);
        setParsedTweets(tweets);
        
        // Select all tweets by default
        setSelectedTweets(new Set(tweets.map(t => t.id)));
        
        setStep('preview');
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file');
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  const handlePastedContent = (content: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to detect format and parse
      const format = detectImportFormat(content);
      if (format === 'unknown') {
        throw new Error('Unsupported content format. Please use JSON, CSV, or Markdown.');
      }
      
      const tweets = parseImportedData(content);
      setParsedTweets(tweets);
      
      // Select all tweets by default
      setSelectedTweets(new Set(tweets.map(t => t.id)));
      
      setStep('preview');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse content');
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setStep('importing');
      setLoading(true);
      
      // Filter only selected tweets
      const tweetsToImport = parsedTweets.filter(tweet => selectedTweets.has(tweet.id));
      
      // In a real implementation, we would save these to the database here
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onImportComplete(tweetsToImport);
      showToast(`Successfully imported ${tweetsToImport.length} tweets`, 'success');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import tweets');
      setLoading(false);
      setStep('preview');
    }
  };

  const toggleTweetSelection = (id: string) => {
    const newSelected = new Set(selectedTweets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTweets(newSelected);
  };

  const toggleAllTweets = () => {
    if (selectedTweets.size === parsedTweets.length) {
      // Deselect all
      setSelectedTweets(new Set());
    } else {
      // Select all
      setSelectedTweets(new Set(parsedTweets.map(t => t.id)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {step === 'upload' && 'Import Tweets'}
            {step === 'preview' && 'Preview Tweets'}
            {step === 'importing' && 'Importing Tweets...'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setImportMethod('file')}
                  className={`flex-1 p-6 border-2 rounded-lg flex flex-col items-center gap-3 transition-colors ${
                    importMethod === 'file'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Upload className="w-8 h-8" />
                  <span className="font-medium">Upload File</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    JSON, CSV, or Markdown
                  </span>
                </button>

                <button
                  onClick={() => setImportMethod('paste')}
                  className={`flex-1 p-6 border-2 rounded-lg flex flex-col items-center gap-3 transition-colors ${
                    importMethod === 'paste'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <FileText className="w-8 h-8" />
                  <span className="font-medium">Paste Content</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Paste JSON, CSV, or Markdown
                  </span>
                </button>
              </div>

              {importMethod === 'file' && (
                <div className="mt-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json,.csv,.md,.txt"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center gap-3 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    )}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {loading ? 'Processing...' : 'Click to select a file'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Supported formats: JSON, CSV, Markdown
                    </span>
                  </button>
                </div>
              )}

              {importMethod === 'paste' && (
                <div className="mt-4">
                  <textarea
                    className="w-full h-64 p-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Paste your JSON, CSV, or Markdown content here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    onClick={() => handlePastedContent(importData)}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    disabled={loading || !importData.trim()}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Parse Content'
                    )}
                  </button>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <h4 className="font-medium mb-2">Privacy Notice</h4>
                <p className="text-sm">
                  Your tweets are processed locally in your browser. Sensitive information is filtered out before saving to the database. We never share your data with third parties.
                </p>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={selectedTweets.size === parsedTweets.length && parsedTweets.length > 0}
                    onChange={toggleAllTweets}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select All ({selectedTweets.size}/{parsedTweets.length})
                  </label>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {parsedTweets.length} tweets found
                </div>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {parsedTweets.map((tweet) => (
                  <div
                    key={tweet.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      selectedTweets.has(tweet.id)
                        ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTweets.has(tweet.id)}
                        onChange={() => toggleTweetSelection(tweet.id)}
                        className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {tweet.authorName || 'Unknown Author'}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-sm">
                            @{tweet.authorUsername || 'unknown'}
                          </div>
                          <div className="text-gray-400 dark:text-gray-500 text-xs">
                            {new Date(tweet.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 mb-2">{tweet.text}</p>
                        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {tweet.metrics && (
                            <>
                              <span>❤️ {tweet.metrics.likes}</span>
                              <span>🔄 {tweet.metrics.retweets}</span>
                              <span>💬 {tweet.metrics.replies}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Importing {selectedTweets.size} tweets...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This may take a moment
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t dark:border-gray-700 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          
          {step === 'preview' && (
            <button
              onClick={handleImport}
              disabled={loading || selectedTweets.size === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Import {selectedTweets.size} Tweets
            </button>
          )}
        </div>
      </div>
    </div>
  );
}