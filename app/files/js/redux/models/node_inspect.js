const INSPECT = 'skep/inspect_node/INSPECT';
const CLOSE_INSPECT = 'skep/inspect_node/CLOSE_INSPECT';

const defaultState = {
  inspectedNode: null,
};

export default function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case INSPECT: return { ...state, inspectedNode: action.payload.nodeID };
    case CLOSE_INSPECT: return { ...state, inspectedNode: null };
    default: return state;
  }
}

export function inspectNode(nodeID) {
  return { type: INSPECT, payload: { nodeID } };
};

export function closeInspect() {
  return { type: CLOSE_INSPECT };
};
