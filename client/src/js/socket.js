import io from 'socket.io-client';

const socket = io({ path: '/bridge' });

export default socket;
