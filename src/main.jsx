import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './assets/global.css'
import { Provider } from 'react-redux'
import store from './context/store.js'
import { BrowserRouter } from 'react-router-dom'
import { MessageProvider } from './components/message/MessageProvider.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Provider store={store}>
            <MessageProvider>
                <App />
            </MessageProvider>
        </Provider>
    </BrowserRouter>
)
