import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Home } from './Pages/home.jsx';
import { Services } from './Pages/services.jsx';
import { Finale } from './Pages/finale.jsx';
import { Reviews } from './Pages/reviews.jsx';
import { TranslationProvider } from './context/TranslationContext.jsx';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/home', element: <Home /> },
  { path: '/services', element: <Services /> },
  { path: '/finale', element: <Finale /> },
  { path: '/reviews', element: <Reviews /> },
  { path: '*', element: <h1>404 - Page Not Found</h1> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TranslationProvider>
      <RouterProvider router={router} />
    </TranslationProvider>
  </React.StrictMode>,
);