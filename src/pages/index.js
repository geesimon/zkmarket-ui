import * as React from 'react';
import Layout from '../components/Layout';
import {Button} from 'react-bootstrap';
import { setCookie } from '/static/utils';
import AllConfig from '/static/config.json';

const ENV = "env";

const IndexPage = () => {
  //Make use of url query "env=<main, dev, test>" to speficy a configuration settings
  if(typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(ENV) && AllConfig.hasOwnProperty(urlParams.get(ENV))){    
      setCookie(ENV, urlParams.get(ENV), 7);
    }  
  }

  return (
    <Layout pageTitle="Home Page">
      <h1>Welcome to zkMarket Finance!</h1>
      <p>zkMarket Finance is a ZKP based web3 application that anyone can buy and sell coins anonymously.</p>
      <div className="d-grid gap-2">
        <Button variant="primary" size="lg" href="buy">
        Buy Coins
        </Button>
        <Button variant="secondary" size="lg" href="sell">
        Sell Coins
        </Button>
      </div>
    </Layout>
  )
}

export default IndexPage