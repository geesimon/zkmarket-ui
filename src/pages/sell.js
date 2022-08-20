import React from 'react'
import Layout from '../components/Layout';
import {Card, Button, Form, Row, Col} from 'react-bootstrap';
import {getPoolSize,
        getSellerInfo, 
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
    const [poolSize, setPoolSize] = React.useState(0);                                                

    React.useEffect(() => {
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
        await sellerDeposit(deposit.paypalAccount, deposit.amount);
    }
 
    return (
        <Layout pageTitle="Deposit USDC Coin">
            <h1>Welcome Seller!</h1>
            <Card>
                <Card.Body>
                <Card.Subtitle className="mb-3 text-muted">Total Pool Size: {poolSize} (USDC) </Card.Subtitle>
                <Card.Subtitle className="mb-2 text-muted">Current Balance in Pool: {sellerInfo.balance} (USDC) </Card.Subtitle>
                </Card.Body>
                <Card.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Paypal Account</Form.Label>
                        <Form.Control type="email" value={deposit.paypalAccount} onChange={handleChangePaypalAccount}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Amount to Deposit</Form.Label>
                        <Form.Control type="input" value={deposit.amount} onChange={handleChangeAmount}/>
                    </Form.Group>
                    <Button variant="primary" size="lg" onClick={handleDepositClick} disabled={(deposit.amount === 0 || deposit.paypalAccount.length < 8)}>
                        Deposit
                    </Button>
                </Form>
                </Card.Body>
            </Card>
        </Layout>
    )
}

export default IndexPage