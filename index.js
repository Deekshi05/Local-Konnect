import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
// import Head from './example';
// import Header from './ex2';
// import Top from './ex3';
// import Bot from './ex4';
import BidCard from './new_tender_card';
// import MyButton from './test';
import 'bootstrap/dist/css/bootstrap.min.css';
// import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <Head></Head> */}
    {/* <Header></Header> */}
    {/* <App /> */}
    {/* <Top></Top> */}
    {/* <Bot></Bot> */}
    {/* <MyButton></MyButton> */}
    <BidCard></BidCard>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
