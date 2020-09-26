import { createStore, combineReducers } from 'redux';
import charts from './models/charts';
import dashboard from './models/dashboard';
import nodes from './models/node';
import nodeInspect from './models/node_inspect';
import swarm from './models/swarm';

const store = createStore(
  combineReducers({ charts, dashboard, nodes, swarm, nodeInspect })
);

export default store;
