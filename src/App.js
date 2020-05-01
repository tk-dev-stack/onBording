import React from "react";
import AppRouting from "./appRouting";
import { dataSharingService } from "./Utils/data-sharing.service";
import { withRouter } from "react-router-dom";

class App extends React.Component {
  constructor(props){
  super(props);
  this.state={
    showSuccessNotification:false,
    showFailureNotification:false,
    showTokenInvalidMessage:false,
    slideClass:'',
    successMsg:'',
    failureMsg:'',
    tokenInvalidMsg:''
  }
  }
  
  componentDidMount() {
    this.getMessage();
    this.getTokenInvalidMsg();
  }
  componentWillUnmount() {
    this.subscription.unsubscribe();
  }
  
  getTokenInvalidMsg(){
    this.subscription = dataSharingService.getTokenInvalidMessage().subscribe(message => {
      if (message.tokenInvalidMsg!==undefined) {
        this.setState({ tokenInvalidMsg:  message.tokenInvalidMsg });
        setTimeout(() => {
          this.setState({
            showTokenInvalidMessage : true,    
            slideClass:'alert alert-expired fade show animated faster slideInRight'
          })
        },3000)
        setTimeout(() => {
          this.setState({
            slideClass:'alert alert-success fade show animated slow slideOutRight',
           showTokenInvalidMessage : false,
           tokenInvalidMsg:''
          });
          sessionStorage.clear();
          this.props.history.push('/login');
         },9000)    
    }   
  });
  }
  
  getMessage(){
    this.subscription = dataSharingService.getSuccessMessage().subscribe(data => {
      if(data.obj!==undefined){
  if(data.obj.status==="Success" && data.obj.message!==''){
      this.setState({ successMsg: data.obj.message });
      setTimeout(() => {
        this.setState({
          showSuccessNotification : true,    
          slideClass:'alert alert-success fade show animated faster slideInRight'
        })
      },3000)
      setTimeout(() => {
        this.setState({
          slideClass:'alert alert-success fade show animated slow slideOutRight',
         showSuccessNotification : false,
         successMsg:''
        })
       },9000)    
  }
   if(data.obj.status==="Fail" && data.obj.message!==''){
    this.setState({ failureMsg: data.obj.message});
    setTimeout(() => {
      this.setState({
        showFailureNotification : true,    
        slideClass:'alert alert-failure fade show animated faster slideInRight'
      })
    },3000)
    setTimeout(() => {
      this.setState({
        slideClass:'alert alert-failure fade show animated slow slideOutRight',
       showFailureNotification : false,
       failureMsg:''
      })
     },9000)    
  }
  }   
    });
  }
  
  render() {
    return (
      <div className="main-container">
          {this.state.showSuccessNotification===true && this.state.successMsg!==' ' ?
          <div className={this.state.slideClass}> {this.state.successMsg}</div>:null} 

          {this.state.showFailureNotification===true && this.state.failureMsg!==' ' ?
          <div className={this.state.slideClass}> {this.state.failureMsg}</div>:null} 
          
          {this.state.showTokenInvalidMessage===true && this.state.tokenInvalidMsg!==' ' ?
          <div className={this.state.slideClass}> {this.state.tokenInvalidMsg}</div>:null}  
          <AppRouting  />
          </div>
      );
  }
}
export default withRouter(App);