

import SimpleCrypto from "simple-crypto-js";

var secretKey = "F%&qw%&gjasdsHFY&^Rui";
export const EncryptDecryptLocalStorageService = {
    setToLocalStorage,
    getLocalStorage,
    encryptText,
    decryptText,
    removeItemLocalStorage

}




function setToLocalStorage(key, value) {
    var encryptedKey = window.btoa(key);
    var encryptedValue = this.encryptText(value);
    localStorage.setItem(encryptedKey, encryptedValue);
}

function getLocalStorage(key) {
    var encryptedKey = window.btoa(key);
    var localStorageEncryptedValue = localStorage.getItem(encryptedKey);
    var plainText = this.decryptText(localStorageEncryptedValue);
    return plainText;
}

function encryptText(plainText) {
    var simpleCrypto = new SimpleCrypto(secretKey);
    var chiperText = simpleCrypto.encrypt(plainText);
    return chiperText;
}
function decryptText(chiperText) {
    if (chiperText) {
        var simpleCrypto = new SimpleCrypto(secretKey);
        var plainText = simpleCrypto.decrypt(chiperText);
        return plainText;
    }

}

function removeItemLocalStorage(key) {
    var encryptedKey = window.btoa(key);
   localStorage.removeItem(encryptedKey);
}


