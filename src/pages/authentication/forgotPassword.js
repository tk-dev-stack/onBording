import React from 'react';
import { Button, Form, Input, Row, Col, Icon } from 'antd';
import { Link } from 'react-router-dom'
import { GenericApiService } from '../../Utils/GenericService'
import UrlConstants from '../../Utils/UrlConstant'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
class ForgotPassword extends React.Component {
  state = {
    loading: false,
    iconLoading: false,
    error: ''
  };
constructor(props){
  super(props);
}



  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        var url = UrlConstants.forgotPasswordUrl + 'email=' + values.emailId
        var payload = ''
        GenericApiService.Post(url, payload,true).then(user => {
         if (user.status.success === 'Success') {
            // this.setState({
            //   mailMessage: true,
            //   error: ''
            // })
            setTimeout(()=>{
              this.props.history.goBack();
            },5000)
           
         }
          // else {
          //   this.setState({
          //     error: user.status.message,
          //     mailMessage: false
          //   })
          // }
        }, 
        error => {
          this.setState({
            error: 'Invalid User'
          })

        }
        )

      }
    });
  }
  handleChange = () => {
    this.setState({
      mailMessage: '',
      error: '',
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (


      <div className="login-container">
        <div className="login-form">
        <div className="forgot-sec">
          <h3>Forgot Password? </h3>
          <p>we'll help reset it and get you back on track</p>          
            <Form hideRequiredMark onSubmit={this.handleSubmit}>                
                <FormItem label="Email Address">
                  {getFieldDecorator('emailId', {

                    rules: [{ required: true, message: 'Please enter your email address' },
                    {
                      pattern: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,3})$/,
                      message: 'Please enter a valid email!',
                    }],
                  })(
                    <Input id="email-id"
                      placeholder=""
                      onChange={this.handleChange}
                      maxLength={50} />
                  )}
                </FormItem>
              
              {/* {this.state.error ? (
                <p className="error">{this.state.error}</p>
              ) : (null)} */}
              {/* {this.state.mailMessage ? (
                <p className="success">Successfully Requested to Reset Password </p>
              ) : (null)} */}
              <Form.Item>
              <Link to="/login"> <Icon className="link-arrow" type="arrow-left" /> Back</Link>
              <Button className='login-btn'
              type='primary'  shape="round"
                htmlType="submit" >Reset Password</Button>
                </Form.Item>
            </Form>
            </div>
          </div>
      </div>

    );
  }
}
const WrappedForgotForm = Form.create({ name: 'forgotPassword' })(ForgotPassword);

export default WrappedForgotForm;
