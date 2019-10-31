const PING = 'skep/node/PING';
const UNPING = 'skep/node/UNPING';
const UPDATE = 'skep/node/UPDATE';

function merge(state, node) {
  const current = state[node.hostname];
  const newNode = Object.assign({}, node, { previous: current });
  return Object.assign({}, state, { [node.hostname]: newNode });
}

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case UPDATE: return merge(state, action.payload);
    case PING: return merge(state, action.payload);
    case UNPING: return merge(state, action.payload);
    default: return state;
  }
}

export function pingNode(node) {
  return { type: UPDATE, payload: Object.assign({ ping: true }, node) };
}

export function unpingNode(node) {
  return { type: PING, payload: Object.assign({ ping: false }, node) };
}

export function updateNode(node) {
  return { type: UNPING, payload: node };
}
