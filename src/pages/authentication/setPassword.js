import React from 'react';
import { Button, Form, Input, } from 'antd';
import { GenericApiService } from '../../Utils/GenericService'
import UrlConstant from '../../Utils/UrlConstant'
import { EncryptDecryptLocalStorageService } from '../../Utils/EncryptDecryptLocalStorageService'
import {  commonService } from '../../Utils/ConvertintoByteArray'
const FormItem = Form.Item

function getUrlVars() {
  var vars = {}
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value

  })
  return vars
}
class SetPassword extends React.Component {
  state = {
    error: '',
    passwordUnmatch: '',
  };


  componentDidMount() {


    var GenerateToken = getUrlVars()['token'] ? getUrlVars()['token'] : 'Wrong' //url_path[1]
    var primaryEmail = getUrlVars()['email'] ? getUrlVars()['email'] : ''

    if (GenerateToken === 'Wrong') {
      this.setState({
        error: true
      })
    } else {
      var url = UrlConstant.tokenverifyUrl + GenerateToken


      var payload = ''

      GenericApiService.Post(url, payload,false).then(
        user => {

          if (user.status.message === 'Valid Reset Password Token') {
            EncryptDecryptLocalStorageService.setToLocalStorage('primaryEmail', primaryEmail)
            this.setState({ error: false })
          } else {
            this.setState({ error: true })
          }
        },
        error => this.setState({ error: true }),
      )

    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {

        var GenerateToken = getUrlVars()['token'] ? getUrlVars()['token'] : 'Wrong' //url_path[1]

        if (values.newpassword === values.confirmpassword && GenerateToken !== 'Wrong') {

          var passwordinbytes = commonService.ConvertStringToByteArray(values.confirmpassword)

          var email = EncryptDecryptLocalStorageService.getLocalStorage('primaryEmail')

          var url = UrlConstant.resetPasswordUrl
          var payload = {
            email: email, password: passwordinbytes,
          }


          GenericApiService.Post( url, payload,true ).then(
            user => {
              if (user.status.message === 'Password Updated Successfully') {
                this.setState({ error: false })
                setTimeout(() => {
                  this.props.history.push('/login')
                }, 5000)

              } else {
                this.setState({ error: true })

              }
            },
            error => this.setState({ error: true }),
          )
        } else {
          this.setState({ passwordUnmatch: true })
        }
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (

      <div className="login-container">
        <div className="login-form">
            <h3>Set Password </h3>
            <p>Just one Step, to complete  your login process </p>          
              {this.state.error ? (                
                   <h6 className="error">
                    <strong>Seems like your email link has been Expired !</strong>
                  </h6>
               ) : ( 
                  <Form hideRequiredMark onSubmit={this.handleSubmit}>                    
                    <FormItem label="New Password">
                      {getFieldDecorator('newpassword', {
                        rules: [{ required: true, message: 'Please input your password' },
                        ],
                      })(
                        <Input.Password id="new-password"
                        maxLength={30} />
                      )}
                    </FormItem>     
                    <FormItem label="Confirm Password">
                      {getFieldDecorator('confirmpassword', {
                        rules: [{ required: true, message: 'Please input your password' },
                        ],
                      })(
                        <Input.Password id="confirm-password" 
                        maxLength={30}/>
                        
                      )}
                    </FormItem>               
                    {this.state.passwordUnmatch ? (
                      <div className="error">
                        Passwords do not match
                       </div>
                    ) : null}                    
                    <FormItem>
                  <Button className="login-btn"
                      type='primary' shape="round"
                      htmlType="submit" >SET PASSWORD</Button>
                  </FormItem>
                  </Form>
                  
                 )}

            </div>

      </div>

    );
  }
}
const WrappedForgotForm = Form.create({ name: 'setPassword' })(SetPassword);

export default WrappedForgotForm;
