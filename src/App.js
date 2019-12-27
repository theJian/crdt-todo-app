import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          <strong>CRDT</strong> todo apps
        </p>
        <main>
          <ol>
            <li>
              <p><a>Collabration</a></p>
            </li>
            <li>
              <p><a>Offline First</a></p>
            </li>
            <li>
              <p><a>Optimistic UI</a></p>
            </li>
          </ol>
        </main>
      </header>
    </div>
  );
}

export default App;
