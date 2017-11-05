/* global SOCKET_HOST */
import io from 'socket.io-client';

const socket = io(SOCKET_HOST);
export default socket;
