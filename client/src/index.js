import React from 'react';
import { render } from 'react-dom';
import {app} from './js/app'
import App from './js/HootNetApp';
import './css/app.scss';
import './css/tailwind.css';
import { Provider } from 'overmind-react';

import 'react-toastify/dist/ReactToastify.css';

const renderApp = () => render(
    <Provider value={app}>
        <App />
    </Provider>


    , document.getElementById('root'));
renderApp()
if (module.hot) {
    module.hot.accept(['./js/app','./js/HootNetApp'], () => {
        renderApp();
    });

}