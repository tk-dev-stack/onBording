import { GenericApiService } from "./Utils/GenericService";
import UrlConstant from "./Utils/UrlConstant";

const Auth = {
    isAuthenticated: false,

    signout(props) {
         GenericApiService.Post(UrlConstant.logout,'',false).then((response)=>{
            if(response.status.success=='Success'){
               sessionStorage.clear();
               localStorage.clear();
               props.history.push('/login');
            }
            }).catch(function (err) {
              return console.log(err);
            });
    },

    getAuth() {
        this.isAuthenticated=sessionStorage.getItem('isAuthorized:');
        return this.isAuthenticated;
    }
    };
    export default Auth;