const UPDATE = 'skep/swarm/UPDATE';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case UPDATE: return Object.assign({}, state, action.payload);
    default: return state;
  }
}

export function updateSwarm(swarm) {
  return { type: UPDATE, payload: swarm };
}
