import * as React from 'react'
import Layout from '../components/Layout';
import PaypalCheckoutButton from '../components/PaypalCheckoutButton';
import {postPaypalTransaction, postTransactionProof, postWithdrawalProof} from '/static/contract';

const PayPage = ({location}) => {    
    React.useEffect(() => {
        // Add snarkjs script
        const script = document.createElement('script');
        script.src = "/snarkjs.min.js";
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const transaction = {
        commitmentHash: location.state.commitmentHash,
        amount: location.state.amount,
        nullifier: location.state.nullifier,
        secret: location.state.secret
    }

    const product = {
        amount: transaction.amount,
        description: 'zkMarket Coin {' + transaction.commitmentHash + '}'
    }
    
    const handlePaypalApprove = async (_orderDetails) => {
        const paypalAmount = _orderDetails.purchase_units[0].amount.value;
        const paypalDescription = _orderDetails.purchase_units[0].description;
        
        if (Number(paypalAmount) !== Number(transaction.amount)) {
            console.log(paypalAmount, transaction.amount);
            alert('Amount Mismatch!');
            return;
        }

        postPaypalTransaction(paypalAmount, paypalDescription);
        postTransactionProof(transaction);
    }

    return (
        <Layout pageTitle="Pay with Paypal">
        <PaypalCheckoutButton 
            product = {product}
            handleApprove = {handlePaypalApprove}
        />
        </Layout>
    )
}

export default PayPage