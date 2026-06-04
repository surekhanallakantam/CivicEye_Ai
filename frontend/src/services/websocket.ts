let ws: WebSocket | null = null;
let reconnectTimer: any = null;

export function initWebSocket() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  // Determine port: FastAPI dev server is on port 8000
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = window.location.hostname;
  const wsUrl = `${protocol}//${hostname}:8000/ws`;
  
  console.log('[WebSocket] Connecting to:', wsUrl);
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('[WebSocket] Connection established successfully.');
    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[WebSocket] Message received:', data);
      
      if (data.event) {
        // Dispatch a custom DOM event so individual components can react to it
        const customEvent = new CustomEvent(`ws-${data.event}`, { detail: data });
        window.dispatchEvent(customEvent);
      }
    } catch (e) {
      console.error('[WebSocket] Error parsing event message:', e);
    }
  };

  ws.onclose = (event) => {
    console.log('[WebSocket] Connection closed:', event.reason || 'No reason provided.');
    ws = null;
    // Attempt reconnect every 5 seconds
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        initWebSocket();
      }, 5000);
    }
  };

  ws.onerror = (err) => {
    console.error('[WebSocket] Socket encountered error:', err);
    if (ws) {
      ws.close();
    }
  };
}
