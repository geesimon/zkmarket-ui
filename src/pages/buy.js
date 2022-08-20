import * as React from 'react'
import Layout from '../components/Layout';
import { navigate } from "gatsby"
import {Card, Button, Form, Row, Col, Spinner} from 'react-bootstrap';
import {generateCommitment, getPoolSize} from '/static/contract';

const IndexPage = () => {
    const [amount, setAmount] = React.useState(0);
    const [poolSize, setPoolSize] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [recipient, setRecipient] = React.useState('');

    React.useEffect(() => {
        // Add snarkjs script
        const script = document.createElement('script');
        script.src = "/snarkjs.min.js";
        document.body.appendChild(script);

        getPoolSize().then(balance => setPoolSize(balance));

        return () => {
            document.body.removeChild(script);
        }        
    }, []);

    const handleChangeAmount = (event) =>{
        setAmount(Number(event.target.value));
    }
    
    const handleChangeRecipient = (event) =>{
        setRecipient(event.target.value);
    }

    const handlePayClick = async () => {
        if (poolSize < amount) {
            alert('Sorry, the pool size is too small to satisfy this amount');
            return;
        }
        setLoading(true);

        const commitment = await generateCommitment(amount * (10 ** 6));
        const param = {
            ...commitment,
            recipient: recipient
        }

        navigate("/pay/", { state: param});
    }
 
    return (
        <Layout pageTitle="Purchase Coin">
            <h1>Welcome Buyer!</h1>
            <Card>
                <Card.Body>
                <Card.Subtitle className="mb-3 text-muted">Total Pool Size: {poolSize} (USDC) </Card.Subtitle>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Recipient Address</Form.Label>
                        <Form.Control type="input" value={recipient} onChange={handleChangeRecipient}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Amount to Deposit</Form.Label>
                        <Form.Control type="input" value={amount} onChange={handleChangeAmount}/>
                    </Form.Group>
                    <Button variant="primary" size="lg" onClick={handlePayClick} disabled={(amount === 0 || recipient.length != 42)}>
                        {loading &&
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                        }
                        Pay
                    </Button>
                </Form>
                {/* <Form >
                    <Form.Group as={Row} className="mb-3">
                    <Col sm={10}>
                        <Form.Check
                        type="radio"
                        label="$10"
                        name="amount_group"
                        id = "amount_0"
                        value = "10"
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
                            type="input"
                            onChange = {handleChangeAmount}
                            value = {amount}
                        />
                    </Col>
                    </Form.Group>
                    <Button variant="primary" size="lg" onClick={handlePayClick} disabled={(amount === 0) || loading}>
                        {loading &&
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            />
                        }
                        Pay
                    </Button>
                    </Form>           */}
                </Card.Body>
            </Card>
        </Layout>
    )
}

export default IndexPage