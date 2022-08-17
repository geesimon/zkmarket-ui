import * as React from 'react'
import Layout from '../components/Layout';
import { navigate } from "gatsby"
import {generateTransaction} from '/static/utils'
import {Card, Button, Form, Row, Col} from 'react-bootstrap';

const IndexPage = () => {
    let amount;

    React.useEffect(() => {
        // Add snarkjs script
        const script = document.createElement('script');
        script.src = "/snarkjs.min.js";
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const handleChangeAmount = (event) =>{
        amount = Number(event.target.value)
    }

    const handlePayClick = async () => {
        const transaction = await generateTransaction();

        const product = {
            description: 'zkMarket Coin {' + transaction.commitmentHash + '}',
            amount: amount
        }
        navigate("/pay/", { state: {product} })
    }
 
    return (
        <Layout pageTitle="Purchase Coin">
            <h1>Welcome to zkMarket Finance!</h1>
            <Card >
                <Card.Body>
                <Card.Title>Please choose the amount you want to buy</Card.Title>        
                <Form >
                    <Form.Group as={Row} className="mb-3">
                    <Col sm={10}>
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
                            // placeholder = {product.amount}
                        />
                    </Col>
                    </Form.Group>
                    <Button variant="primary" size="lg" onClick={handlePayClick}>Pay</Button>
                    </Form>          
                </Card.Body>
            </Card>
        </Layout>
    )
}

export default IndexPage