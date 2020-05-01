import {createStore} from 'redux';
import reducer from './reducer';

const RoleStore=createStore(reducer);
export default RoleStore;
