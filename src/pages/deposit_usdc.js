import React from 'react'
import Layout from '../components/Layout';
import {Card, Button, Form, Row, Col} from 'react-bootstrap';
import {getSellerBalance, sellerDeposit} from '/static/contract';

const IndexPage = () => {
    const [balance, setBalance] = React.useState(0);
    const [amount, setAmount] = React.useState(0);

    React.useEffect(() => {
        getSellerBalance().then(balance => setBalance(balance));
    }, []);

    const handleChangeAmount = (event) =>{
        setAmount(Number(event.target.value));
    }
    
    const handleDepositClick = async () => {
        await sellerDeposit(amount);
    }
 
    return (
        <Layout pageTitle="Deposit USDC Coin">
            <h1>Welcome Seller!</h1>
            <Card>
                <Card.Body>                
                <Card.Subtitle className="mb-2 text-muted">Current Balance: {balance} (USDC) </Card.Subtitle>
                <Form >
                    <Form.Group as={Row} className="mb-3">
                    <Col sm={10}>
                        <Form.Check
                        type="radio"
                        label="$1"
                        name="amount_group"
                        id = "amount_0"
                        value = "1"
                        onChange = {handleChangeAmount}
                        />
                        <Form.Check
                        type="radio"
                        label="$100"
                        name="amount_group"
                        id = "amount_1"
                        value = "100"
                        onChange = {handleChangeAmount}
                        />
                        <Form.Check
                        type="radio"
                        label="$200"
                        name="amount_group"
                        id="amount_2"
                        value = "200"
                        onChange = {handleChangeAmount}
                        />
                        <Form.Check
                        type="radio"
                        label="$500"
                        name="amount_group"
                        id="amount_3"
                        value = "500"
                        onChange = {handleChangeAmount}
                        />
                        <Form.Check
                        type="radio"
                        label="$1000"
                        name="amount_group"
                        id="amount_4"
                        value = "1000"
                        onChange = {handleChangeAmount}
                        />
                        <Form.Check
                        type="radio"
                        label="Enter an amount"
                        name="amount_group"
                        id="amount_4"
                        value = "0"
                        />
                        <Form.Control
                            id = "inlineFormInputGroupUsername"
                            placeholder = {amount}
                        />
                    </Col>
                    </Form.Group>
                    
                    <Button variant="primary" size="lg" onClick={handleDepositClick} disabled={(amount === 0)}>
                        Deposit
                    </Button>
                    </Form>          
                </Card.Body>
            </Card>
        </Layout>
    )
}

export default IndexPage