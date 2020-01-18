import React from 'react';

const Panel = ({ id, primary }) => {
  return (
    <div className="panel">
      <p>ID: <span className="value">{id}</span></p>
      <p>Node: <span className="value primary">{primary ? 'Primary' : 'Node'}</span></p>
    </div>
  )
}

export default Panel;
