import { ethers } from 'ethers';
import PaypalUSDCAssetPoolContract from '../src/contracts/PaypalUSDCAssetPool.json';
import USDCTokenContract from '../src/contracts/IERC20.json';

import AllConfig from './config.json';
import {
        rbigint, 
        bigInt2BytesLE, 
        pedersenHasher, 
        bits2PathIndices, 
        getCookie
        } from './utils.js';

const bigInt = require('big-integer');
const CommitmentCircuitWASMFile = "../commitment.wasm";
const CommitmentCircuitKey = "../circuit_commitment_final.zkey";
const WithdrawalCircuitWASMFile = "../withdrawal.wasm";
const WithdrawalCircuitKey = "../circuit_withdrawal_final.zkey";
// const CommitmentCircuitVerificationKey = "../commitment_verification_key.json"
// const WithdrawalCircuitVerificationKey = "../withdrawal_verification_key.json";

const TREE_LEVELS = 20;

const env = getCookie("env") ? getCookie("env") : 'dev';
const config = AllConfig[env];
// console.log(config);

const PaypalUSDCAssetPoolAbi = PaypalUSDCAssetPoolContract.abi;
const USDCTokenAbi = USDCTokenContract.abi;

export const generateCommitment = async (
                                            _amount = rbigint(31),
                                            _secret = rbigint(31), 
                                            _nullifier = rbigint(31)
                                        ) => {
    const preimage = Buffer.concat([
                                    Buffer.from(bigInt2BytesLE(_nullifier, 31)),
                                    Buffer.from(bigInt2BytesLE(_secret, 31)),
                                    Buffer.from(bigInt2BytesLE(_amount, 31))
                                    ]);

    let commitmentHash = await pedersenHasher(preimage);

    return {
        commitmentHash: commitmentHash.toString(),
        amount: _amount.toString(),
        nullifier: _nullifier.toString(),
        secret: _secret.toString()
    };
};


export const getFee = (_amount) => {
    return ethers.BigNumber.from(_amount).mul(4).div(100);
}

export const generateWithdrawInput = async ( _commitment, _treeInfo, _recipient) => {
    return {
        root: _treeInfo.root.toString(),
        nullifierHash: (await pedersenHasher(bigInt2BytesLE(_commitment.nullifier, 31))).toString(),
        recipient: bigInt(_recipient.slice(2), 16).toString(),
        amount: _commitment.amount,
        relayer: bigInt(config.RELAYER_ADDRESS.slice(2), 16).toString(),
        fee: getFee(_commitment.amount).toString(),
        nullifier: _commitment.nullifier,
        secret: _commitment.secret,
        pathElements: _treeInfo.pathElements,
        pathIndices: bits2PathIndices(Number(_treeInfo.pathIndices), TREE_LEVELS)
    };
}

export const packProofData = (_proof) => {
    return [
        _proof.pi_a[0], _proof.pi_a[1],
        _proof.pi_b[0][1], _proof.pi_b[0][0], _proof.pi_b[1][1], _proof.pi_b[1][0],
        _proof.pi_c[0], _proof.pi_c[1],
    ]
};

const postToRelayer = async (_url, _jsonData) => {
    const rawResponse = await window.fetch(_url, {
                                        method: 'POST',
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                        body: _jsonData});

    const response = await rawResponse.json();

    return response;
    }

export const postPaypalCommitment = async (_amount, _description) => {
    const reqJson = JSON.stringify({amount: _amount, description: _description});    
    const resp = await postToRelayer(config.REGISTER_COMMITMENT_URL, reqJson);

    return resp.code === 0;
}

export const postCommitmentProof = async (_commitment) => {
    const {proof, publicSignals} = await window.snarkjs.groth16.fullProve(
                                            _commitment,
                                            CommitmentCircuitWASMFile,
                                            CommitmentCircuitKey
                                        );
    const proofData = packProofData(proof);

    const reqJson = JSON.stringify({proofData: proofData, publicSignals: publicSignals});
    return await postToRelayer(config.PROVE_COMMITMENT_URL, reqJson);
}

export const postWithdrawalProof = async (_withdrawalInput) => {
    const {proof, publicSignals} = await window.snarkjs.groth16.fullProve(
                                            _withdrawalInput,
                                            WithdrawalCircuitWASMFile,
                                            WithdrawalCircuitKey
                                        );
    const proofData = packProofData(proof);

    const reqJson = JSON.stringify({proofData: proofData, publicSignals: publicSignals});
    console.log(reqJson);
    const resp = await postToRelayer(config.WITHDRAW_URL, reqJson);
    return resp.code === 0;
}

const getWeb3Provider = async () => {
    const {ethereum} = window;
    
    if(!ethereum) {
        throw new Error('Please make sure you have Metamask compatible wallet installed!');
    }
    console.log('Current network Id:', parseInt(ethereum.chainId).toString());

    // Swith to appropriate chain
    if (!ethereum.chainId || !config.CHAIN_IDS.includes(parseInt(ethereum.chainId).toString())){    
        console.log("Swith network to:", config.CHAIN_IDS[0]);
        const chainID = '0x'+ parseInt(config.CHAIN_IDS[0]).toString(16);
        try{
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainID }]
            });
            console.log("Switch done!");
        } catch(switchError){
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                // Add network to MetaMask
                await ethereum.request({
                                        method: 'wallet_addEthereumChain',
                                        params: [
                                        {
                                            chainId: chainID,
                                            chainName: config.CHAIN_NAME,
                                            rpcUrls: [config.CHAIN_URL],
                                            nativeCurrency: {
                                                            symbol: config.CHAIN_CURRENCY_SYMBOL
                                                            },
                                            blockExplorerUrls:[config.CHAIN_EXPLORER_URL]
                                        },
                                        ],
                                    });
            } else{
                throw switchError;
            }
        }
    }

  return new ethers.providers.Web3Provider(ethereum);
}

const connectWallet = async () => {
    const web3Provider = await getWeb3Provider();
    
    await web3Provider.send("eth_requestAccounts", []);
    return web3Provider.getSigner();
}


export const getSellerInfo = async() => {
    const provider = await connectWallet();
    const paypalUSDCAssetPool = new ethers.Contract(
                                                    config.PAYPAL_USDC_ASSET_POOL_CONTRACT_ADDRESS, 
                                                    PaypalUSDCAssetPoolAbi, 
                                                    provider
                                                );
    const sellerInfo = await paypalUSDCAssetPool.getSellerInfo();
    
    return {
        paypalAccount: sellerInfo.paypalAccount,
        balance: Number(ethers.BigNumber.from(sellerInfo.balance).div(10**6).toString())
    }

    // const currentUserAddress = await provider.getAddress()
    // console.log(currentUserAddress);
    // const usdcTokenAddress = await paypalUSDCAssetPool.getUSDCTokenAddress();
    // const usdcToken = new ethers.Contract(
    //                                         usdcTokenAddress, 
    //                                         USDCTokenAbi, 
    //                                         provider
    //                                     );

    // const balance = await usdcToken.balanceOf(currentUserAddress)

    // return Number(balance.div(ethers.BigNumber.from(10**6)));    
}

export const sellerDeposit = async(_paypalAccount, _amount) => {
    const usdcAmount = ethers.BigNumber.from(_amount).mul(10 ** 6);

    const provider = await connectWallet();
    const paypalUSDCAssetPool = new ethers.Contract(
                                                    config.PAYPAL_USDC_ASSET_POOL_CONTRACT_ADDRESS, 
                                                    PaypalUSDCAssetPoolAbi, 
                                                    provider
                                                );
    const usdcTokenAddress = await paypalUSDCAssetPool.getUSDCTokenAddress();
    const usdcToken = new ethers.Contract(
                                            usdcTokenAddress,
                                            USDCTokenAbi, 
                                            provider
                                        );
    let tx = await usdcToken.approve(config.PAYPAL_USDC_ASSET_POOL_CONTRACT_ADDRESS, usdcAmount.toString());
    await tx.wait();
    
    tx = await paypalUSDCAssetPool.sellerDeposit(_paypalAccount, usdcAmount.toString());
    await tx.wait();
}

export const getPoolSize = async() => {
    const provider = await getWeb3Provider();

    const paypalUSDCAssetPool = new ethers.Contract(
                                                    config.PAYPAL_USDC_ASSET_POOL_CONTRACT_ADDRESS,
                                                    PaypalUSDCAssetPoolAbi, 
                                                    provider
                                                    );
    const balance = await paypalUSDCAssetPool.getBalance(config.PAYPAL_USDC_ASSET_POOL_CONTRACT_ADDRESS);

    return Number(ethers.BigNumber.from(balance).div(10**6));
}

export const getWalletBalance = async() => { 
    const provider = await connectWallet();

    const paypalUSDCAssetPool = new ethers.Contract(
                                                    config.PAYPAL_USDC_ASSET_POOL_CONTRACT_ADDRESS,
                                                    PaypalUSDCAssetPoolAbi, 
                                                    provider
                                                    );
    const balance = await paypalUSDCAssetPool.getBalance(provider.getAddress());

    return Number(ethers.BigNumber.from(balance).div(10**6));
}