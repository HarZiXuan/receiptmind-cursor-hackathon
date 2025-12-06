import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import App from './App';
import './styles.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  console.error('❌ VITE_CONVEX_URL is not set! Please create a .env file with your Convex URL.');
  console.log('To fix this:');
  console.log('1. Run: npx convex dev');
  console.log('2. This will create a .env file with your Convex URL');
}

const convex = new ConvexReactClient(convexUrl || 'https://placeholder.convex.cloud');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);

