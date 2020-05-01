

import SimpleCrypto from "simple-crypto-js";

var secretKey = "F%&qw%&gjasdsHFY&^Rui";
export const EncryptDecryptSessionStorageService = {
    setToSessionStorage,
    getSessionStorage,
    encryptText,
    decryptText,
    removeItemSesstionStorage,
  
    setObjectToSessionStorage,
    getObjectSessionStorage,
    encryptObject,
    decryptObject
}

function setToSessionStorage(key, value) {
    var encryptedKey = window.btoa(key);
    var encryptedValue = this.encryptText(value);
    sessionStorage.setItem(encryptedKey, encryptedValue);
}

function getSessionStorage(key) {
    var encryptedKey = window.btoa(key);
    var sessionStorageEncryptedValue = sessionStorage.getItem(encryptedKey);
    var plainText = this.decryptText(sessionStorageEncryptedValue);
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

function setObjectToSessionStorage(key, value) {
    var encryptedKey = window.btoa(key);
    var encryptedValue = this.encryptText(value);
    sessionStorage.setItem(encryptedKey, encryptedValue);
}

function getObjectSessionStorage(key) {
    var encryptedKey = window.btoa(key);
    var sessionStorageEncryptedValue = sessionStorage.getItem(encryptedKey);
    var plainObject = this.decryptObject(sessionStorageEncryptedValue);
    return plainObject;
}
function encryptObject(plainObject) {
    var simpleCrypto = new SimpleCrypto(secretKey);
    var chiperObject = simpleCrypto.encrypt(plainObject);
    return chiperObject;
}
function decryptObject(chiperObject) {
    if (chiperObject) {
        var simpleCrypto = new SimpleCrypto(secretKey);
        var plainObject = simpleCrypto.decrypt(chiperObject,true);
        return plainObject;
    }

}

function removeItemSesstionStorage(key) {
    var encryptedKey = window.btoa(key);
    sessionStorage.removeItem(encryptedKey);
}


