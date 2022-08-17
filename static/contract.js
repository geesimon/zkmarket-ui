import AllConfig from './config.json';
import * as utils from './utils.js';
import { getCookie } from './cookie';

const bigInt = require('big-integer');

const CommitmentCircuitWASMFile = "../commitment.wasm";
const CommitmentCircuitKey = "../circuit_commitment_final.zkey";
const CommitmentCircuitVerificationKey = "../commitment_verification_key.json"
const WithdrawalCircuitWASMFile = "../withdrawal.wasm";
const WithdrawalCircuitKey = "../circuit_withdrawal_final.zkey";
const WithdrawalCircuitVerificationKey = "../withdrawal_verification_key.json";

const TREE_LEVELS = 20;

const env = getCookie("env") ? getCookie("env") : 'main';
const config = AllConfig[env];
// console.log(config);

export const packProofData = (proof) => {
  return [
    proof.pi_a[0], proof.pi_a[1],
    proof.pi_b[0][1], proof.pi_b[0][0], proof.pi_b[1][1], proof.pi_b[1][0],
    proof.pi_c[0], proof.pi_c[1],
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

export const postPaypalTransaction = async (amount, description) => {
  const reqJson = JSON.stringify({amount: amount, description: description});
  
  console.log(reqJson);
  // postToRelayer()
}

export const postTransactionProof = async (transaction) => {
    const {proof, publicSignals} = await window.snarkjs.groth16.fullProve(
        transaction,
        CommitmentCircuitWASMFile,
        CommitmentCircuitKey
    );
    const proofData = packProofData(proof);

    const reqJson = JSON.stringify({proofData: proofData, publicSignals: publicSignals});
    console.log(reqJson);
}

export const postWithdrawalProof = (transaction, recipient) => {

}