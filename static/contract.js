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

const env = getCookie("env") ? getCookie("env") : 'main';
const config = AllConfig[env];
// console.log(config);

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

export const calcFee = (grossAmount) => {
    const fee = Math.round(Number(grossAmount) * 0.01);
    
    if (fee < 1) {
        return 1;
    } else {
        return fee;
    }
}

export const generateWithdrawInput = async ( _commitment, _treeInfo, _recipient) => {
    return {
        root: _treeInfo.root.toString(),
        nullifierHash: (await pedersenHasher(bigInt2BytesLE(_commitment.nullifier, 31))).toString(),
        recipient: bigInt(_recipient.slice(2), 16).toString(),
        amount: _commitment.amount,
        relayer: bigInt(config.RELAYER_ADDRESS.slice(2), 16).toString(),
        fee: calcFee(_commitment.amount).toString(),
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