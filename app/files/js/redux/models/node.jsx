import React from 'react';
import moment from 'moment';

const PING = 'skep/node/PING';
const UNPING = 'skep/node/UNPING';
const SELECT = 'skep/node/SELECT';
const UPDATE = 'skep/node/UPDATE';

function merge(state, node) {
  const current = state[node.hostname];
  const newNode = Object.assign({}, node, { previous: current });

  if (current) newNode.selected = current.selected || false;

  // Prevent memory leak (retaining all historic state):
  if (newNode.previous && newNode.previous.previous) delete newNode.previous.previous;

  return Object.assign({}, state, { [node.hostname]: newNode });
}

function mergeSelected(state, hostname) {
  const newNodes = {};
  for (const [key, value] of Object.entries(state)) {
    newNodes[key] = Object.assign({}, value);
    newNodes[key].selected = hostname === key ? !state[key].selected : false;
  }

  return newNodes;
}

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case PING: return merge(state, action.payload);
    case SELECT: return mergeSelected(state, action.payload);
    case UPDATE: return merge(state, action.payload);
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

export function selectNode(hostname) {
  return { type: SELECT, payload: hostname };
}
