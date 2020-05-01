import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { HashRouter } from "react-router-dom";
import "antd/dist/antd.css";
import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';
import {Provider} from 'react-redux';
import RoleStore from './store/roleStore';

ReactDOM.render(
    <Provider store={RoleStore}>
    <HashRouter>
        <App />
    </HashRouter>
    </Provider>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
