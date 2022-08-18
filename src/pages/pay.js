import * as React from 'react'
import Layout from '../components/Layout';
import PaypalCheckoutButton from '../components/PaypalCheckoutButton';
import {
    postPaypalCommitment, 
    postCommitmentProof,
    generateWithdrawInput,
    postWithdrawalProof
    } from '/static/contract';

const RECIPIENT_ADDRESS='0x360e7cc953ea07d97bb21647285155a83ad35e09';

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

    const commitment = {
        commitmentHash: location.state.commitmentHash,
        amount: location.state.amount,
        nullifier: location.state.nullifier,
        secret: location.state.secret
    }

    const product = {
        amount: commitment.amount,
        description: 'zkMarket Coin {' + commitment.commitmentHash + '}'
    }
    
    const handlePaypalApprove = async (_orderDetails) => {
        const paypalAmount = _orderDetails.purchase_units[0].amount.value;
        
        if (Number(paypalAmount) !== Number(commitment.amount)) {
            console.log(paypalAmount, commitment.amount);
            alert('Amount Mismatch!');
            return;
        }

        let ret = await postPaypalCommitment(
            commitment.amount, 
            'zkMarket Coin {' + commitment.commitmentHash + '}'
        );
        if (!ret) {
            console.log('Failed to post paypal commitment!');
            return;
        }

        const treeInfo = await postCommitmentProof(commitment);
        if (treeInfo.root === undefined) {
            console.log('Failed to post commitment proof!');
            return;
        }

        const withdrawalInput = await generateWithdrawInput(commitment, treeInfo, RECIPIENT_ADDRESS);
        console.log(withdrawalInput);
        ret = await postWithdrawalProof(withdrawalInput);
            if (!ret) {
            console.log('Failed to post withdrawal proof!');
            return;
        } 
        console.log('Done!');
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