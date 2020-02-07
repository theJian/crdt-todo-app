import Peer from 'peerjs';
import am from 'automerge';

const peerOption = {
  host: 'localhost', port: 9000, path: '/peer',
};

class Conn {
  constructor(id, docSet) {
    const peer = new Peer(id, peerOption);
    peer.on('connection', conn => {
      console.log('new connection', conn.peer)

      conn.on('data', msg => {
        console.log('receive message:', msg)
        this.connections[conn.peer].receiveMsg(JSON.parse(msg));
      });

      this.connect(conn.peer);
    });
    this.peer = peer;
    this.docSet = docSet;
    this.connections = {};
  }

  connect(id) {
    if (this.connections[id]) return;
    const peerConn = this.peer.connect(id);
    const connection = new am.Connection(this.docSet, msg => {
      console.log('send message: ', msg)
      peerConn.send(JSON.stringify(msg));
    });
    this.connections[id] = connection;
    peerConn.on('disconnected', () => {
      connection.close();
      delete this.connections[id];
    });
    peerConn.on('open', () => {
      connection.open();
    });
  }
}

export default Conn;
