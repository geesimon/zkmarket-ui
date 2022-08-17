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

export const setCookie = (name, value, days) => {
    if( typeof document === "undefined") return;

    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }
  
export const getCookie = (name) => {
    if( typeof document === "undefined") return;

    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
  
export const eraseCookie = (name) => {
    if( typeof document === "undefined") return;

    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}