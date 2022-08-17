const circomlibjs = require('circomlibjs');
const bigInt = require('big-integer');

export const bits2PathIndices = (_bitmap, _length) => {
    const bits = Number(_bitmap).toString(2).split('').map(b => b - '0');
    
    return Array(_length - bits.length).fill(0).concat(bits)
}

export const mimcHasher = async (left, right) => {
    let mimcSponge = await circomlibjs.buildMimcSponge();
  
    return mimcSponge.F.toObject(mimcSponge.hash(left, right, 0).xL);
  }
  
export const pedersenHasher = async (data) => {
    let pedersenHash = await circomlibjs.buildPedersenHash();
    let babyJub = await circomlibjs.buildBabyjub();
    
    return babyJub.F.toObject(babyJub.unpackPoint(pedersenHash.hash(data))[0]);
}
  
export const rbigint = (nbytes) => bigInt.randBetween(0, bigInt(2).pow(nbytes * 8));
export const toFixedHex = (number, length = 32) => '0x' + bigInt(number).toString(16).padStart(length * 2, '0');
  
export const bigInt2BytesLE = (_a, len) => {
    const b = Array(len);
    let v = bigInt(_a);
  
    for (let i=0; i<len; i++) {
        b[i] = v.and(0xFF).toJSNumber();
        v = v.shiftRight(8);
    }
    return b;
};


export const generateTransaction = async (
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