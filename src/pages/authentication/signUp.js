import React from 'react';
import { Button, Form, Input, Icon } from 'antd';
import { Link } from 'react-router-dom'
import { GenericApiService } from '../../Utils/GenericService'
import UrlConstants from '../../Utils/UrlConstant'
import Option from 'rc-mentions/lib/Option';
const FormItem = Form.Item

class SignUp extends React.Component {
  state = {
    loading: false,
    iconLoading: false,
    message: '',
    error: '',
    emailError:'',
    buttonDisabled:false,
    submitBtn:false

  };




  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
       
        if (/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,3})$/.test(values.emailId)){
          this.setState({
            emailError:'',
            buttonDisabled:false
          })
        
        var url = UrlConstants.signupUrl
        // var payload = JSON.stringify({
        var payload = {

          "name": values.orgName,
          "emailId": values.emailId,
          "isActive": true,
        }

            this.setState({
              submitBtn:true
            });
        GenericApiService.Post(url, payload, true).then(user => {
          if (user.status.success === 'Success') {
            this.setState({
              submitBtn:false
            })
            setTimeout(() => {
              this.props.history.push('/login')
            }, 5000)

          }
          else {
            this.setState({
              error: user.status.message,
              submitBtn:false
            })


          }


        }, error => {
          this.setState({
            error: error.status.message,
            submitBtn:false

          })

        }
        )


      }
      else{
        this.setState({
        emailError:'Please enter valid email address',
        buttonDisabled:true
        }) 
       
      }
    }

    })
  }



  handleChange = () => {
    
    this.setState({
      error: '',
      emailError:''
    })
  }
  handlenumberKeyPress = evt => {
    evt = evt ? evt : window.event
    var charCode = evt.which ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      evt.preventDefault()
    }
  }
 
  render() {
    const { getFieldDecorator, getFieldsError,  } = this.props.form;

    function hasErrors(fieldsError) {
      return Object.keys(fieldsError).some(field => fieldsError[field])
    }
    return (


      <div className="login-container">

        <div className="login-form">
          <h2>Sign Up </h2>
          <p>Create Your New Account</p>
          <Form hideRequiredMark onSubmit={this.handleSubmit}>
            <FormItem label="Organization Name">
              {getFieldDecorator('orgName', {

                rules: [{ required: true, message: 'Please enter your organization name' },
                ],
              })(
                <Input id="org-name"
                  onChange={this.handleChange}
                  className="col-sm-12" 
                  maxLength={30}/>
                  
                  
              )}

            </FormItem>
            <FormItem label="Email Address">
              {getFieldDecorator('emailId', {
               
                rules: [
                
                { required: true, message: 'Please enter your email address' }],
              })(
                <Input id="email-id"
                  onChange={this.handleChange}
                  maxLength={50}
                   />

              )}
             
            </FormItem>
            {this.state.emailError ? (
                <p style={{color:'red',height:30}}>{this.state.emailError}</p>
              ) : (null)}
            
            {this.state.error ? (
                <p style={{color:'red',height:30}}>{this.state.error}</p>
              ) : (null)}
              {this.state.message ? (
                <p className="success">{this.state.message}</p>
              ) : (null)}

            <FormItem>
            

              <Link to="/login">Already a Member? Sign In</Link>
              <Button
                type='primary'
                className="login-btn"
                loading={this.state.submitBtn}
                disabled={hasErrors(getFieldsError())===true?true:false}
                htmlType="submit" shape="round" >SIGN UP <Icon className="btn-arrow" type="arrow-right" />
                {/* <span className="btn-arrow">></span> */}
              </Button>
            </FormItem>
          </Form>

        </div>



      </div>


    );
  }
}
const WrappedSignUpForm = Form.create({ name: 'signUp' })(SignUp);

export default WrappedSignUpForm;
