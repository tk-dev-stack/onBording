import React from "react";
import HomeRouting from "./homeRouting";
import HeaderComponent from "../../component/headerComponent";
import {Layout, Icon } from 'antd';
import RoleStore from "../../store/roleStore";
import { connect } from 'react-redux';
import { GenericApiService } from "../../Utils/GenericService";
import UrlConstant from "../../Utils/UrlConstant";

const { Header, Content } = Layout;
class Home extends React.Component {
  goback = () => {
      this.props.history.goBack();
  }
  constructor(props){
    super(props);
    this.getComponetList();
    this.state={}
  }
   getComponetList(){
    GenericApiService.Post(UrlConstant.componentsList,false).then(response => {
      if(response.status.success=="Success"){
        RoleStore.dispatch({type:"setPermission",component:response.data}); 
      }
    });
     }
  render() {
    return (
      <Layout>
        <Header><HeaderComponent/></Header>
        <Content>       
          
          <HomeRouting role={this.props.role}/>
        </Content>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({
  role: state
})
export default connect(mapStateToProps)(Home);
// export default Home;
