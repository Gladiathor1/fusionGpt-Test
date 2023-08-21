import io from 'socket.io-client';

const isProduction = process.env.NODE_ENV === 'production';

const SOCKET_SERVER_URL = isProduction
  ? 'https://fusiongpt.apq.ai'
  : 'http://localhost:3001';

export const socket = io(SOCKET_SERVER_URL);

function sendLog(logString: string, logType: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' = 'INFO') {
    const logData = {
        message: logString,
        type: logType
    };

    // Send a log message to the server
    socket.emit('save-log', logData);

    // Listen for the response event from the server
    socket.on('log-status', (response) => {
        console.log(logString, "Log Message");
        console.log('Server responded:', response.message);
    });
}

export default sendLog;