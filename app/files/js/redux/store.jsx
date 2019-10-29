import { createStore, combineReducers } from 'redux';
import charts from './models/charts';
import dashboard from './models/dashboard';
import nodes from './models/node';
import swarm from './models/swarm';

const store = createStore(
  combineReducers({ charts, dashboard, nodes, swarm })
);

export default store;
