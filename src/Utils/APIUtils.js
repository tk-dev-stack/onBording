import {EncryptDecryptSessionStorageService} from './EncryptDecryptSessionStorageService'
import {dataSharingService }from '../Utils/data-sharing.service';

export const request =async(options)=> {
    var sessiontoken=EncryptDecryptSessionStorageService.getSessionStorage('sessiontoken')
   const requestOptions = {
    method: options.method,
    headers: { 'Content-Type': 'application/json' ,
                sessionToken:sessiontoken,
            },
    body:options.body
  }
    return fetch(options.url, requestOptions)
    .then(response => 
        response.json().then(json => {
            if(!response.ok) {
                return Promise.reject(json);
            }
            if(options.shownotification=== true &&  json.status.message !=="Token is Invalid" ){
                notify(json);
            }
            if( json.status.message ==="Token is Invalid" ){
                tokenInvalid();
            }
            return json;
        })
    );
};

export const request1 =async(options)=> {
    var sessiontoken=EncryptDecryptSessionStorageService.getSessionStorage('sessiontoken')
   const requestOptions = {
    method: options.method,
    headers: { Accept: 'application/json' ,
                sessionToken:sessiontoken,
            },
    body:options.body
  }
    return fetch(options.url, requestOptions)
    .then(response => 
        response.json().then(json => {
            if(!response.ok) {
                return Promise.reject(json);
            }
            if(options.shownotification=== true &&  json.status.message !=="Token is Invalid" ){
                notify(json);
            }
            if( json.status.message =="Token is Invalid" ){
                tokenInvalid();
            }
            return json;
        })
    );
};

function notify(response){
        dataSharingService.setMessage({message:response.status.message,status:response.status.success});
    
    // if (response.status.success == 'fail' || response.status.success == "Fail") {
    //     dataSharingService.sendFailureMessage(response.status.message);
    // }
}
function tokenInvalid(){
    dataSharingService.setTokenInvalidMsg("Session expired please login again... ");
}
