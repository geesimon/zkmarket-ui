import * as React from 'react'
import Layout from '../components/Layout';
import PaypalCheckoutButton from '../components/PaypalCheckoutButton';

const PayPage = ({location}) => {
    // const [product, setProduct] = React.useState({
    //     description: "abcd",
    //     amount: 123,
    // });

    const handlePaypalApprove = async (_orderDetails) => {
        console.log("Got paid:", _orderDetails);

    }

    const product = location.state.product;
    console.log(product);
    return (
        <Layout pageTitle="Pay with Paypal Coin">
        <PaypalCheckoutButton 
            product = {product}
            handleApprove = {handlePaypalApprove}
        />
        </Layout>
    )
}

export default PayPage