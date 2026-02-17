ouWallet App
A cryptocurrency trading web application built with a Node.js backend and a Vue.js frontend.

Project Structure
backend: Node.js/Express server that interacts with the Criptoya API.
final: Vue.js frontend application.
Prerequisites
Node.js (v20+ recommended)
npm
Installation
Clone the repository.
Install dependencies: Run the following command in the root directory to install dependencies for the root, backend, and frontend:
npm run install-all
Alternatively, you can install them manually:
Root: npm install
Backend: cd backend && npm install
Frontend: cd final && npm install
Running the Application
To start both the backend and frontend servers concurrently:

npm run dev
Backend: Runs on http://localhost:3001
Frontend: Runs on http://localhost:8080
