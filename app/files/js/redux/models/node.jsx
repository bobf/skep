const UPDATE = 'skep/node/UPDATE';

function merge(state, node) {
  const current = state[node.hostname];
  const newNode = Object.assign({}, node, { previous: current });
  return Object.assign({}, state, { [node.hostname]: newNode });
}

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case UPDATE: return merge(state, action.payload);
    default: return state;
  }
}

export function updateNode(node) {
  return { type: UPDATE, payload: node };
}
