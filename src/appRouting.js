import React from "react";
import { Switch, Route ,Redirect} from "react-router-dom";
import Home from './pages/homeComponent/home';
import Login from "../src/pages/authentication/login";
import ForgotPassword from "../src/pages/authentication/forgotPassword";
import SetPassword from "./pages/authentication/setPassword";
import SignUp from "../src/pages/authentication/signUp";
import Auth from "./auth";
const PrivateRoute = ({ component: Home, ...rest }) => (
  <Route
  {...rest}
  render={props =>
  Auth.getAuth() ? (
  <Home {...props} />
  ) : (
  <Redirect
  to={{
  pathname: "/"
  }}
  />
  )
  }
  />
)      
class AppRouting extends React.Component {
  
render() {

    return (
        <Switch>
        <PrivateRoute path="/home" component={Home} />
        <Route path={`/login`} exact component={Login} />
        <Route path={`/forgotpassword`}  component={ForgotPassword} />
        <Route path={`/setpassword`}  component={SetPassword} />
        <Route path={`/signup`}  component={SignUp} />
        {/* <Route path={`/home`}  component={Home} /> */}
        <Redirect from="/" to="/login" />
      </Switch>
    );
  }
}

export default AppRouting;