import moment from 'moment';

const UPDATE = 'skep/swarm/UPDATE';
const DISCONNECT = 'skep/swarm/DISCONNECT';
const PING = 'skep/swarm/PING';
const UNPING = 'skep/swarm/UNPING';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case UPDATE: return Object.assign({}, state, action.payload, { connectionLive: moment().utc().valueOf() });
    case DISCONNECT: return Object.assign({}, state, action.payload, { connectionLive: null });
    case PING: return Object.assign({}, state, action.payload, { ping: true });
    case UNPING: return Object.assign({}, state, action.payload, { ping: false });
    default: return state;
  }
}

export function updateSwarm(swarm) {
  return { type: UPDATE, payload: swarm };
}

export function disconnectSwarm(swarm) {
  return { type: DISCONNECT, payload: {} };
}

export function pingSwarm(swarm) {
  return { type: PING, payload: {} };
}

export function unpingSwarm(swarm) {
  return { type: UNPING, payload: {} };
}
