import { createStore, combineReducers } from 'redux';
import dashboard from './models/dashboard';
import nodes from './models/node';
import swarm from './models/swarm';

const store = createStore(
  combineReducers({ dashboard, nodes, swarm })
);

export default store;
