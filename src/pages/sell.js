import React from 'react'
import Layout from '../components/Layout';
import {Card, Button, Form, Spinner} from 'react-bootstrap';
import {getPoolSize,
        getSellerInfo,
        getWalletBalance,
        sellerDeposit} from '/static/contract';

const IndexPage = () => {
    const [sellerInfo, setSellerInfo] = React.useState({
                                                        paypalAccount: '',
                                                        balance: 0
                                                    });
    const [deposit, setDeposit] = React.useState({
                                                    paypalAccount: '',
                                                    amount: 0
                                                });
    const [walletBalance, setWalletBalance] = React.useState(0);
    const [poolSize, setPoolSize] = React.useState(0);
    const [working, setWorking] = React.useState(false);    

    const updateBalances = () => {
        getPoolSize().then(balance => setPoolSize(balance));
        getSellerInfo().then(info => {
            setSellerInfo(info);
            setDeposit(prev => {
                return {
                    ...prev,
                    paypalAccount: info.paypalAccount
                }
            });
        });
        getWalletBalance().then(balance => setWalletBalance(balance));
    }

    React.useEffect(() => {
        updateBalances();
    }, []);

    const handleChangeAmount = (event) =>{
        setDeposit(prev =>{
            return {
              ...prev,
              amount : Number(event.target.value)
            }}
        );
    }
    
    const handleChangePaypalAccount = (event) => {
        setDeposit(prev =>{
            return {
              ...prev,
              paypalAccount : event.target.value
            }}
        );
    }
    
    const handleDepositClick = async () => {
        setWorking(true);
        try {
            await sellerDeposit(deposit.paypalAccount, deposit.amount);
            updateBalances();
        } catch(e) {
            console.log(e);
        }        
        setWorking(false);
    }
 
    return (
        <Layout pageTitle="Deposit USDC Coin">
            <h1>Welcome Seller!</h1>
            <Card>
                <Card.Body>
                <Card.Subtitle className="mb-3 text-muted">Total Pool Size: {poolSize} (USDC) </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">Current Balance in Pool: {sellerInfo.balance} (USDC) </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">Current Balance in Wallet: {walletBalance} (USDC) </Card.Subtitle>
                </Card.Body>
                <Card.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Paypal Account to Receive Fund</Form.Label>
                        <Form.Control type="email" value={deposit.paypalAccount} onChange={handleChangePaypalAccount}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Amount to Deposit</Form.Label>
                        <Form.Control type="input" value={deposit.amount} onChange={handleChangeAmount}/>
                    </Form.Group>
                    <Button variant="primary" size="lg" onClick={handleDepositClick} disabled={(deposit.amount === 0 || deposit.paypalAccount.length < 8 || working)}>
                        {working &&
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                        }
                        Deposit
                    </Button>
                </Form>
                </Card.Body>
            </Card>
        </Layout>
    )
}

export default IndexPage