import api from './api';

/**
 * @module initializeWebSocket
 * @desc    Initializes a WebSocket connection to the server, handles incoming messages,
 *          and manages WebSocket error handling. It also handles state updates related to loading and status.
 * @param {Function} setLoading - A function to update the loading state.
 * @param {Function} setStatus - A function to update the status displayed on the UI.
 * @returns {Function} - A cleanup function that closes the WebSocket connection when called.
 */
const initializeWebSocket = async (setLoading, setStatus) => {
  try {
    const wsPort = await fetchWebSocketPort();
    const socket = new WebSocket(`ws://localhost:${wsPort}`);

    socket.onmessage = (event) => handleWebSocketMessage(event, setStatus);
    socket.onerror = handleWebSocketError;
    setLoading((prevState) => ({ ...prevState, webSocket: false }));
    return () => socket.close();
  } catch (error) {
    console.error('WebSocket initialization error:', error);
  }
};

/**
 * @function fetchWebSocketPort
 * @desc    Fetches the WebSocket port from the server through an API call.
 * @returns {Promise<number>} - The WebSocket port returned from the server.
 */
const fetchWebSocketPort = async () => {
  const response = await api.get('/configuration/getwsPort');
  return response.data.wsPort;
};

/**
 * @function handleWebSocketMessage
 * @desc    Handles the incoming WebSocket messages, parsing the message data
 *          and updating the status to reflect the received message.
 * @param {MessageEvent} event - The event containing the incoming WebSocket message.
 * @param {Function} setStatus - A function to update the status displayed in the UI.
 */
const handleWebSocketMessage = (event, setStatus) => {
  const data = JSON.parse(event.data);
  setStatus((prevStatus) => `${prevStatus}\n${data.stdout}`);
};

/**
 * @function handleWebSocketError
 * @desc    Handles any errors that occur during the WebSocket communication.
 * @param {Error} error - The error object containing error details.
 */
const handleWebSocketError = (error) => {
  console.error('WebSocket error:', error);
};

export default initializeWebSocket;
