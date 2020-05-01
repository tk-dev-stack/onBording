import React from "react";
import { Form,  Input, Button,Icon  } from 'antd';
import { Link } from 'react-router-dom'
import { GenericApiService } from '../../Utils/GenericService'
import UrlConstant from "../../Utils/UrlConstant";
import { commonService } from '../../Utils/ConvertintoByteArray';
import { connect } from 'react-redux';
import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService'
import RoleStore from "../../store/roleStore";
class Login extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      step1validation: true,
      step2validation: false,
      validemail: '',
      error: '',
    emailError:'',
    buttonDisabled:false,
    submitBtn:false
    }
    sessionStorage.clear();
  }
  passwordValidation = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
      
        var passwordinbytes = commonService.ConvertStringToByteArray(values.password)
        var url = UrlConstant.loginUrl
        var payload = {

          "email": this.state.validemail,
          "password": passwordinbytes

        }
        this.setState({
          submitBtn:true
        });
        GenericApiService.Post(url, payload,false).then(user => {
          this.setState({
            submitBtn:false
          });
          if (user.status.success === 'Success') {
             EncryptDecryptSessionStorageService.setToSessionStorage('sessiontoken',user.token);
             EncryptDecryptSessionStorageService.setToSessionStorage('userId',user.data.userId);
             EncryptDecryptSessionStorageService.setToSessionStorage('orgId',user.data.organisationId);
             EncryptDecryptSessionStorageService.setToSessionStorage('domainName',user.data.domainName);
             if (user.data.profileurl != undefined && user.data.profileurl != "" && user.data.profileurl != null) {
              EncryptDecryptSessionStorageService.setToSessionStorage('profileurl', user.data.profileurl);
            } else {
              EncryptDecryptSessionStorageService.setToSessionStorage('profileurl', 'no image');
            }
             if(user.data.role!==null){
             RoleStore.dispatch({type:"setRole",role:user.data.role}); 
             }
             user.status.message==='Authorized User'?  sessionStorage.setItem('isAuthorized:',true): sessionStorage.getItem('isAuthorized:',false);
            this.props.history.push('/home/dashboard');
          }
          else {
            this.setState({
              error: user.status.message
            })
          }
        }
          , error => {
            this.setState({
              error: error.status.message,
              submitBtn:false

            })

          })
      
      }
    });
  };
  handleChange=()=>{
    this.setState({
      error:'',
      emailError:''
    })
  }
  openEmail=()=>{
    this.setState({
      step2validation: false,
      step1validation: true

    })
  }

  mailValidation = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log(values)
      if (!err) {
        if (/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,3})$/.test(values.email)){
          this.setState({
            emailError:'',
            buttonDisabled:false
          })
        var url = UrlConstant.verifyEmailUrl + values.email
        var payload = ''
        this.setState({
          submitBtn:true
        });
        GenericApiService.Post(url, payload,false).then(user => {
          if (user.status.success === 'Success' && user.status.message === 'Email Found') {
            this.setState({

              validemail: values.email,
              step2validation: true,
              step1validation: false,
              submitBtn:false

            })

          }
          else {
            this.setState({
              error: user.status.message,
              submitBtn:false

            })
          }

        }

        ).catch(function (err) {
          this.setState({submitBtn:false});
          return console.log(err);
        });
        }
        else{
          this.setState({
            emailError:'Please enter valid email address',
            buttonDisabled:true
            })     
        }
      }
    });
  };

  renderPasswordValidation() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="pwd-section">
       <Link onClick={this.openEmail} to=""><p>
       {this.state.validemail} <span className="down-arw">></span></p>
       </Link>
        <Form onSubmit={this.passwordValidation} >
          <Form.Item label="Password">
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password' }
              ],
            })(
              <Input.Password
                type="password"
                placeholder=""
                onChange={this.handleChange}
                maxLength={30}
              />,
            )}
            {this.state.error ? (
            <p className="error">{this.state.error}</p>
          ) : (null)}
          </Form.Item>
          
          <Form.Item>
         <Link to="/forgotpassword">Forgot Password?</Link>
            <Button type="primary" loading={this.state.submitBtn} shape="round" htmlType="submit" className="login-btn">
              SIGN IN 
              <Icon className="btn-arrow" type="arrow-right" />
              {/* <span className="btn-arrow">></span> */}
          </Button>       
          </Form.Item>
        </Form>
      </div>
    )
  };

  renderEmailValidation() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="email-section">
      <p onClick={this.backToLogin}>Sign in to Your  Account</p>        
        <Form onSubmit={this.mailValidation} hideRequiredMark  >     
          <Form.Item label="Email Address">
            {getFieldDecorator('email', {
              rules: [{ required: true, message: 'Please input your email address' },
              ],
            })(
              <Input
               type="primary"
                placeholder=""
                onChange={this.handleChange}
              />,
            )}
          </Form.Item>  
          {this.state.error ? (
            <p className="error">{this.state.error}</p>
          ) : (null)}
          {this.state.emailError ? (
                <p style={{color:'red',height:30}}>{this.state.emailError}</p>
              ) : (null)}
            <Form.Item>
              <Link to="/signup">Sign Up to E-Onboard</Link>
              <Button type="primary" loading={this.state.submitBtn}
                htmlType="submit" shape="round"  className="login-btn">
                NEXT <Icon className="btn-arrow" type="arrow-right" />
                {/* <span className="btn-arrow">></span> */}
              </Button>
          </Form.Item> 
        </Form>
      </div>
    )
  };


  render() {
    return (

      <div className="login-container">
        <div className="login-form">        
          <h3>Sign In</h3>          
          {this.state.step1validation === true &&
            this.state.step2validation === false ?
            this.renderEmailValidation() :
            this.renderPasswordValidation()
          }       
        </div>
      </div>

    );
  }
}

const mapStateToProps = (state) => ({
  role: state
})
const WrappedNormalLoginForm = Form.create({ name: 'login' })(Login);

export default connect(mapStateToProps) (WrappedNormalLoginForm);