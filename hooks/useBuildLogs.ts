import React, { useEffect, useState } from 'react';

// This assumes the socket.io client is loaded from a CDN.
declare const io: any;

export function useBuildLogs(buildId: string | null) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!buildId) return;

    // The backend server for WebSocket would be running at this URL.
    // For this frontend-only implementation, it won't connect, but the logic is in place.
    const socket = io(process.env.NEXT_PUBLIC_APP_URL || window.location.origin, {
      path: "/api/ws",
    });

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
      setIsConnected(true);
      socket.emit("subscribe-build", buildId);
    });

    socket.on("build-log", (data: { log: string }) => {
      setLogs((prev) => [...prev, data.log]);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    });
    
    socket.on("connect_error", (err: Error) => {
        console.error("WebSocket connection error:", err.message);
        setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [buildId]);

  return { logs, isConnected };
}