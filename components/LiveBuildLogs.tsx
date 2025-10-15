import React, { useEffect, useRef } from 'react';
import { useBuildLogs } from '../hooks/useBuildLogs';
import { TerminalIcon } from './icons';

interface LiveBuildLogsProps {
  buildId: string;
}

const getLogLineColor = (log: string): string => {
  const lowerLog = log.toLowerCase();
  if (lowerLog.includes('error') || lowerLog.includes('failed') || lowerLog.includes('critical')) {
    return 'text-red-400';
  }
  if (lowerLog.includes('warn') || lowerLog.includes('warning')) {
    return 'text-yellow-400';
  }
  if (lowerLog.includes('success') || lowerLog.includes('complete') || lowerLog.includes('deployed')) {
    return 'text-green-400';
  }
  return 'text-slate-300';
};

const LiveBuildLogs: React.FC<LiveBuildLogsProps> = ({ buildId }) => {
  const { logs, isConnected } = useBuildLogs(buildId);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Add a small buffer for floating point inaccuracies
      isAtBottomRef.current = scrollHeight - scrollTop <= clientHeight + 1;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Only auto-scroll if the user is already near the bottom.
    if (isAtBottomRef.current) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div 
      ref={containerRef} 
      className="mt-4 bg-black/80 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500" 
      tabIndex={0} 
      aria-label="Live build logs"
    >
        <div className="flex items-center gap-2 mb-3 text-sm text-slate-400">
            <TerminalIcon />
            <span>Live Logs</span>
            <span 
              className={`ml-auto w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} 
              title={isConnected ? 'Connected' : 'Disconnected'}
            ></span>
            <span className="text-xs">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      {logs.length === 0 ? (
        <div className="text-gray-500">Waiting for logs...</div>
      ) : (
        logs.map((log, i) => (
          <div key={i} className={`flex items-start ${getLogLineColor(log)}`}>
             <span className="flex-shrink-0 mr-2 text-gray-600 select-none">{String(i + 1).padStart(3, ' ')}</span>
             <span className="flex-1 whitespace-pre-wrap break-words">{log}</span>
          </div>
        ))
      )}
      <div ref={logsEndRef} />
    </div>
  );
};

export default LiveBuildLogs;
