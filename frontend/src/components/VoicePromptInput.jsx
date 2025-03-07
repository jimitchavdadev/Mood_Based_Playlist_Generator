import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, X, Loader } from 'lucide-react';
import axios from 'axios';

export function VoicePromptInput({ onMoodParametersReceived, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'success', 'error'
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        setTranscript(finalTranscript.trim());
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          verifyPrompt(transcript);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setVerificationStatus(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const verifyPrompt = async (prompt) => {
    setIsVerifying(true);
    try {
      const response = await axios.post('http://localhost:5000/api/analyze-mood-prompt', {
        prompt: prompt,
      });

      // Ensure all mood parameters are numeric
      const processedParameters = {};
      for (const [mood, value] of Object.entries(response.data)) {
        processedParameters[mood] = Number(value);
      }

      onMoodParametersReceived(processedParameters);
      setVerificationStatus('success');
    } catch (error) {
      console.error('Error verifying prompt:', error);
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setVerificationStatus(null);
  };

  const handleSubmitPrompt = () => {
    if (transcript.trim()) {
      verifyPrompt(transcript);
    }
  };

  const handleTextPromptChange = (e) => {
    setTranscript(e.target.value);
  };

  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 rounded-xl p-4 mt-4 shadow-lg border border-white/20">
      <h3 className="text-lg font-medium mb-2">Voice/Text Prompt</h3>
      <p className="text-sm text-gray-300 mb-4">Describe your mood and we'll generate a playlist for you</p>

      <div className="relative">
        <textarea
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none resize-none"
          placeholder="Your voice transcript or text input will appear here..."
          value={transcript}
          onChange={handleTextPromptChange}
          rows={3}
          disabled={isListening || isVerifying}
        />

        <div className="flex mt-3 justify-between items-center">
          <div>
            {verificationStatus === 'success' && (
              <div className="flex items-center text-green-400">
                <Check className="w-4 h-4 mr-1" />
                <span className="text-xs">Mood detected!</span>
              </div>
            )}
            {verificationStatus === 'error' && (
              <div className="flex items-center text-red-400">
                <X className="w-4 h-4 mr-1" />
                <span className="text-xs">Couldn't detect mood. Try again.</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {transcript && !isListening && (
              <>
                <button
                  onClick={handleReset}
                  className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
                  disabled={isVerifying}
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSubmitPrompt}
                  className="p-2 rounded-full bg-green-600 hover:bg-green-500"
                  disabled={isVerifying}
                >
                  {isVerifying ? <Loader className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
              </>
            )}
            <button
              onClick={toggleListening}
              className={`p-2 rounded-full ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
              disabled={disabled || isVerifying}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {!window.SpeechRecognition && !window.webkitSpeechRecognition && (
        <p className="text-red-400 text-xs mt-2">Your browser doesn't support Speech Recognition. Try using Chrome, Edge, or Safari.</p>
      )}
    </div>
  );
}