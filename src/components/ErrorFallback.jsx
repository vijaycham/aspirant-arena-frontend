import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-outfit">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-3xl text-red-500" />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">
          System Malfunction
        </h2>
        
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          The Arena encountered a critical error. Our tech team has been notified automatically.
        </p>

        {error && (
          <div className="bg-gray-50 p-4 rounded-xl text-left mb-6 border border-gray-100 overflow-hidden">
            <code className="text-xs text-red-500 font-mono break-all">
              {error.message || "Unknown Error"}
            </code>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
          >
            Reload Page
          </button>
          
          <button
            onClick={resetErrorBoundary}
            className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary-500/30"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
