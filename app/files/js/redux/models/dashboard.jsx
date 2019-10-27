const SELECT_SERVICE = 'skep/dashboard/SELECT-SERVICE';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case SELECT_SERVICE: return Object.assign({}, state, action.payload);
    default: return state;
  }
}

export function selectService(serviceName) {
  return { type: SELECT_SERVICE, payload: { selectedService: serviceName } };
}
