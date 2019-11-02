const REQUEST = 'skep/chart/REQUEST';
const RESPONSE = 'skep/chart/RESPONSE';
export const NO_DATA = 'skep/chart/NO_DATA';

function requestChart(type, calculatorParams) {
  const params = { chartType: type, params: calculatorParams };

  Skep.socket.emit('chart_request', params);

  return { type: REQUEST, payload: { requestID: params.requestID } };
}

function reduceResponse(state, action) {
  const newState = {};
  const { payload } = action;
  const { type, id } = payload.meta;

  newState.node = Object.assign({}, state.nodes, {});
  newState.container = Object.assign({}, state.containers, {});
  newState[type][id] = formatPayload(action.payload);

  return newState;
}

function formatPayload(payload) {
  if (!payload || !payload.chart) return { chart: NO_DATA };

  const { chart, meta, period } = payload;
  const { data, titles } = chart;

  const toDate = (timestamp) => moment.unix(timestamp).toDate();
  const convertTimestamps = (first, ...rest) => [toDate(first)].concat(rest);
  return {
    chart: [titles].concat(data.map((row) => convertTimestamps(...row))),
    meta: meta,
    period: period
  };
}

const defaultState = { node: {}, container: {} };

export default function reducer(state = defaultState, action = {}) {
  switch (action.type) {
    case REQUEST: return Object.assign({}, state);
    case RESPONSE: return reduceResponse(state, action);
    default: return state;
  }
}

export function respondChart(chart) {
  return { type: RESPONSE, payload: chart };
}

export function requestNodeChart(hostname, period) {
  return requestChart('node', { hostname: hostname, period: period });
}

export function requestContainerChart(containerID, period) {
  return requestChart('container', { containerID: containerID, period: period });
}
