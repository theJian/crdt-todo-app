import Peer from 'peerjs';
import am from 'automerge';

let connections = {}

const init = (peer) => {
  peer.on('connection', conn => {
    conn.on('data', msg => {
      connections[conn.peer].receiveMsg(JSON.parse(msg));
    })
  })
}

const connect = (id, peer, docSet) => {
  if (connections[id]) return;
  const peerConn = peer.connect(id);
  const conn = new am.Connection(docSet, msg => {
    peerConn.send(JSON.stringify(msg));
  });
  connections[id] = conn;
  peerConn.on('disconnected', () => {
    conn.close();
    delete connections[id];
  });
  conn.open();
}


export {
  init,
  connect,
}
