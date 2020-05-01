import { Subject } from 'rxjs';

const subject = new Subject();

export const dataSharingService = {
    // sendSuccessMessage: message => subject.next({ successMsg: message }),
    // sendFailureMessage: message => subject.next({ failureMsg: message }),
    setMessage:obj=>subject.next({obj}),
    setTokenInvalidMsg:message=>subject.next({tokenInvalidMsg:message}),

    getTokenInvalidMessage:()=> subject.asObservable(),
    getSuccessMessage: () => subject.asObservable(),
    getFailureMessage: () => subject.asObservable()
    
};
