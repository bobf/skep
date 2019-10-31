const SELECT_SERVICE = 'skep/dashboard/SELECT-SERVICE';
const SELECT_STACK = 'skep/dashboard/SELECT-STACK';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case SELECT_SERVICE: return Object.assign({}, state, action.payload);
    case SELECT_STACK: return Object.assign({}, state, action.payload);
    default: return state;
  }
}

export function selectService(serviceName) {
  return { type: SELECT_SERVICE, payload: { selectedService: serviceName } };
}

export function selectStack(stackName) {
  return { type: SELECT_SERVICE, payload: { selectedStack: stackName } };
}
