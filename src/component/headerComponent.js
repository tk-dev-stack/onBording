import React from "react";
import logo from '../assets/logo.png'
import { Popover, Avatar, Badge, Row, Col, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { EncryptDecryptSessionStorageService } from '../Utils/EncryptDecryptSessionStorageService';
import UrlConstant from "../Utils/UrlConstant";
import { GenericApiService } from "../Utils/GenericService";
import { withRouter } from "react-router-dom";
import Auth from "../auth";
import { connect } from 'react-redux';

class HeaderComponent extends React.Component {
  constructor(props) {
    super(props)
    var userId = EncryptDecryptSessionStorageService.getSessionStorage('userId');
    this.state = {
      loginUser: {},
      userName:'',
      userProfile: EncryptDecryptSessionStorageService.getSessionStorage('profileurl'),
      activeOrg:'',
      activeUser:'',
      visible:false
    }
    this.getLoginUserInfo(userId);
  }
  componentWillUnmount(){
    this.setState({
      loginUser: {},
      userName:'',
      userProfile: '',
      activeOrg:'',
      activeUser:'',
      visible:false
    })
    }
  componentDidUpdate() {
  
    this.content = (
      <div>
        {this.props.role !== undefined ? this.props.role.userPermission.isView == true ? <Link   onClick={this.hide}to='/home/user' >User</Link> : null : null}
        {this.props.role !== undefined ? this.props.role.orgPermission.isView == true ? <Link onClick={this.hide}   to='/home/organisation'>Organisation</Link> : null : null}
         <Link to='' onClick={() => { this.logout() }}>Logout {this.state.activeUser}{this.state.activeOrg}</Link>
      </div>
    );
  }
  

  

  getLoginUserInfo(userId) {
    GenericApiService.Post(UrlConstant.getUserById, { 'userId': userId }, false).then((response) => {
      if (response.data.length !== 0 && response.status.success === 'Success') {
        var res = (response.data.email).split('@');
        this.setState({
          loginUser: response.data,
          userName: res[0]
        });
      }
    }).catch(function (err) {
      return console.log(err);
    });
  }
  logout() {
    Auth.signout(this.props);
  }
  hide = () => {
    this.setState({
      visible: false,
    });
  };

  handleVisibleChange = visible => {
    this.setState({ visible });
  };

 
  render() {
    return (
      <div className="header">
        <div className="logo home-nev" onClick={() => { this.props.history.push('/home/dashboard') }}>
          <img src={logo} className="logoImg" />
          <span className="logo-text">E-Onboard</span>
        </div>
        <div className="welcome-sec">
          <div className="user-name">Welcome <span> {this.state.userName}</span></div>
          <div className="notification">
            <Badge dot>
              <Icon type="bell" theme="filled" style={{ fontSize: '18px', color:'#9094AF', marginLeft: 10, cursor:'pointer' }} />
            </Badge>
          </div>
          <div className="profile-pic">
            <Popover placement="bottomRight" content={this.content} 
            trigger="click" onVisibleChange={this.handleVisibleChange}
            visible={this.state.visible}
  >
            {this.state.userProfile!=='no image'?
                <Avatar style={{ backgroundColor: "#e5eff9",marginLeft:20 }} src={this.state.userProfile} size="large" />:
                <Avatar style={{ backgroundColor: "#D23B7D",marginLeft:20 }}>{this.state.userName.charAt(0).toUpperCase()}</Avatar>
            }
            </Popover>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  role: state
})
export default connect(mapStateToProps)(withRouter(HeaderComponent));


