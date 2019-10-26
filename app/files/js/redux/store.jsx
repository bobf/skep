import { createStore, combineReducers } from 'redux';
import swarm from './models/swarm';
import nodes from './models/node';

const store = createStore(
  combineReducers({ swarm, nodes })
);

export default store;
