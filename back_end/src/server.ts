import http from 'http';
import app from './app';
import listEndpoints from 'express-list-endpoints';

// Use an environment variable for flexibility, fallback to 4000
const PORT = process.env.PORT || 4000;

// creating the server explicitly with 'http' module is good practice
// as it makes it easier to attach other protocols later (like WebSockets)
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(listEndpoints(app));

});

// Optional: Handle neat shutdowns
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});