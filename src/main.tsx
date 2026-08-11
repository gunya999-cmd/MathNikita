import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { LessonPageNavigator } from './LessonPageNavigator';
import './styles.css';
import './adaptive.css';
import './map.css';
import './designRefresh.css';
import './designRefreshPatch.css';
import './topbarResponsive.css';
import './controlWorkTwo.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <LessonPageNavigator />
  </React.StrictMode>,
);
