import React from 'react';
import Layout from './layout/layout';
import Login from './pages/login/login';
import Loading from './components/loading/loading';
import { useSelector } from 'react-redux';
const App = () => {
  const token = localStorage.getItem('access_token');
  const loading = useSelector(state => state.loading)

  return (
    <div className="wrapper">
      {
        loading && <Loading />
      }
      {token ? <Layout /> : <Login />}
    </div>
  );
};


export default App;