import React from 'react'
import {ProgressBar, ButtonToolbar} from 'react-bootstrap';
import Layout from '../components/Layout';
import PaypalCheckoutButton from '../components/PaypalCheckoutButton';
import {
    postPaypalCommitment, 
    postCommitmentProof,
    generateWithdrawInput,
    postWithdrawalProof
    } from '/static/contract';

const PayPage = ({location}) => {
    const [progress, setProgress] = React.useState({
        variant: 'info',
        status: '',
        percentage: 0
    });

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

    const recipent = location.state.recipient;

    const product = {
        amount: commitment.amount / (10 ** 6),
        description: 'zkMarket Coin {' + commitment.commitmentHash + '}'
    }
    
    const handlePaypalApprove = async (_orderDetails) => {
        const paypalAmount = _orderDetails.purchase_units[0].amount.value;
        
        if (Number(paypalAmount) * (10 ** 6) !== Number(commitment.amount)) {
            console.log(paypalAmount, commitment.amount);
            alert('Amount Mismatch!');
            return;
        }

        setProgress({status: 'Wait Paypal Transaction Got Posted to Chain', variant: 'info', percentage: 1});
        let ret = await postPaypalCommitment(
            commitment.amount,
            'zkMarket Coin {' + commitment.commitmentHash + '}'
        );
        if (!ret) {
            setProgress({status: 'Failed to post paypal commitment!', variant: 'danger', percentage: 100});
            return;
        }

        setProgress({status: 'Post Transaction Proof', variant: 'info', percentage: 20});
        const treeInfo = await postCommitmentProof(commitment);
        if (treeInfo.root === undefined) {
            setProgress({status: 'Failed to post commitment proof!', variant: 'danger', percentage: 100});
            return;
        }

        setProgress({status: 'Post Withdrawal Proof', variant: 'info', percentage: 50});
        const withdrawalInput = await generateWithdrawInput(commitment, treeInfo, recipent);
        console.log(withdrawalInput);
        ret = await postWithdrawalProof(withdrawalInput);
            if (!ret) {
                setProgress({status: 'Failed to post withdrawal proof!', variant: 'danger', percentage: 100});
                return;
            } 
        setProgress({status: 'Done', variant: 'info', percentage: 100});
    }

    return (
        <Layout pageTitle="Pay with Paypal">
        {(progress.percentage === 0) ?
                                        (<PaypalCheckoutButton 
                                            product = {product}
                                            handleApprove = {handlePaypalApprove}
                                        />):
                                        (<ProgressBar animated variant={progress.variant} now={progress.percentage} label={progress.status}/>)}
        </Layout>
    )
}

export default PayPage