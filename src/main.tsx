import {createRoot} from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { initAnalytics } from './utils/analytics';
import { registerServiceWorker } from './utils/pwa';
import './index.css';

initAnalytics();
registerServiceWorker();

// reducedMotion="user": Motion drops transform/layout animations for users who
// ask for less motion (opacity fades stay, so state changes remain visible).
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </ErrorBoundary>
);
