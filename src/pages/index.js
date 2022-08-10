import * as React from 'react'
import { Link } from 'gatsby'
import Form from 'react-bootstrap/Form';
import Layout from '../components/Layout';
import InputGroup from 'react-bootstrap/InputGroup';
import PaypalCheckoutButton from '../components/PaypalCheckoutButton';

const IndexPage = () => {
  const [product, setProduct] = React.useState({
    description: 'Buy Coin',
    amountValue: 120,
  });

  const handleChangeAmount = (event) =>{
    setProduct(prev => {
      return {
        ...prev,
        amountValue: Number(event.target.value)
      }
    })
  }

  return (
    <Layout pageTitle="Purchase Coin">
      <h1>Welcome to zkMarket Finance!</h1>
      <br/>
      <InputGroup>
            <InputGroup.Text>Please enter the amount you want to buy</InputGroup.Text>
            <Form.Control
              id="inlineFormInputGroupUsername"
              placeholder={product.amountValue}
              onChange = {handleChangeAmount}
            />
      </InputGroup>
      <br/>
      <PaypalCheckoutButton product = {product} />
      <Link to="/about">About</Link>
    </Layout>
  )
}

// Step 3: Export your component
export default IndexPage