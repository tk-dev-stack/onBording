import {request} from './APIUtils';
import{request1} from './APIUtils';
function Post(url,payload,notification) {
    return request({
        url: process.env.REACT_APP_API_BASE_URL+url,
        method: 'POST',
        body: JSON.stringify(payload) ,
        shownotification:notification
    });
}
function saveformdata(url, payload,notification) {
    return request1({
        url: process.env.REACT_APP_API_BASE_URL+url,
        method: 'POST',
        body:payload,
        shownotification:notification
    });
  }
function GetAll(url) {
    return request({
        url: process.env.REACT_APP_API_BASE_URL + url,
        method: 'GET',
        shownotification:false
    });
}

export const GenericApiService = {
    Post,GetAll,saveformdata
}

