import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Redirect, Route, Switch
} from 'react-router-dom';
import {
  Grid, Paper
} from '@material-ui/core';
import axios from 'axios';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import PhotoStepper from './components/photoStepper/PhotoStepper';
import UserComments from './components/userComments/userComments';
import LoginRegister from './components/loginRegister/LoginRegister';
import ActivityFeed from './components/activityFeed/activityFeed';
import UserSettings from './components/userSettings/userSettings';
import UserPhotosSorted from './components/userPhotosSorted/userPhotosSorted';

const ViewContext = React.createContext();

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: undefined,
      advancedFeatures: window.location.href.includes('/photo/') ? true : false,
      userIsLoggedIn: undefined,
      userFirstName: undefined,
      commentOfUserModel: [],
      sortCheckbox: false
    }
  }

  checkLoginStatus() {
    axios.get('/admin/status').then((response) => {
      this.setState({ 
        userIsLoggedIn: response.data.is_loggedin, 
        userFirstName: response.data.first_name,
        userId: response.data.user_id });
    }).catch((error) => {
      console.log(error);
    })
  }

  setLoginStatus = (status, name, id) => {
    this.setState({ 
      userIsLoggedIn: status,
      userFirstName: name,
      userId: id
     });
  }

  updateCommentModel() {
    axios.get('/user/info').then((response) => {
      this.setState({ commentOfUserModel: response.data });
    }).catch((error) => {
      console.log(error);
    })
  }

  setView = view => {
    this.setState({ view: view })
  }

  toggleFeatures = (event) => {
    this.setState({ advancedFeatures: event.target.checked });
  };

  toggleSortCheckbox(checked) {
    console.log('checked')
    console.log(checked)
    this.setState({ sortCheckbox: checked });
  }

  render() {
    // console.log(this.state.userIsLoggedIn)
    console.log('sortCheckbox')
    console.log(this.state.sortCheckbox)
    return (
      <ViewContext.Provider value={this.state.view}>
        <HashRouter>
          <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <ViewContext.Consumer>
                {view => <TopBar viewMode={view} 
                advancedFeatures={this.state.advancedFeatures} 
                toggleFeatures={this.toggleFeatures.bind(this)}
                setLoginStatus={this.setLoginStatus.bind(this)}
                userIsLoggedIn={this.state.userIsLoggedIn}
                userFirstName={this.state.userFirstName}
                />}
              </ViewContext.Consumer>
            </Grid>
            <div className="cs142-main-topbar-buffer"/>
            <Grid item sm={3}> 
            {
              this.state.userIsLoggedIn ? <Paper className="cs142-main-grid-item">
              <UserList commentOfUserModel={this.state.commentOfUserModel}
              advancedFeatures={this.state.advancedFeatures} />
            </Paper> : <Paper className="cs142-main-grid-item"></Paper>
            }
            </Grid>
            <Grid item sm={9} key={this.state.userIsLoggedIn}>
              <Paper className="cs142-main-grid-item">
                  <Switch>
                    <Route exact path="/" 
                    render={ props => this.state.userIsLoggedIn ? <ActivityFeed {...props} setView={ this.setView.bind(this) } /> :
                      <Redirect to='/login-register' /> }
                    />
                    <Route exact path="/users/:userId"
                    render={ props => this.state.userIsLoggedIn ? <UserDetail {...props} setView={ this.setView.bind(this) } /> :
                      <Redirect to='/login-register' /> }
                    />
                    <Route exact path="/photos/:userId"
                    render={ props => this.state.userIsLoggedIn ? 
                      this.state.advancedFeatures ? <Redirect to={'/photos/' + props.match.params.userId + '/photo/0'} /> : 
                      this.state.sortCheckbox ? <UserPhotosSorted {...props} setView={ this.setView.bind(this) } 
                      updateCommentModel={ this.updateCommentModel.bind(this) }
                      userId={this.state.userId} 
                      toggleSortCheckbox={ this.toggleSortCheckbox.bind(this, false) }/> : 
                      <UserPhotos {...props} setView={ this.setView.bind(this) } 
                      updateCommentModel={ this.updateCommentModel.bind(this) }
                      userId={this.state.userId} 
                      toggleSortCheckbox={ this.toggleSortCheckbox.bind(this, true) }/> :
                      <Redirect to='/login-register' /> }
                    />
                    <Route exact path="/photos/:userId/photo/:photoNumber"
                      render={ props => this.state.userIsLoggedIn ? 
                        this.state.advancedFeatures ? <PhotoStepper {...props} setView={ this.setView.bind(this) } 
                        updateCommentModel={ this.updateCommentModel.bind(this) } 
                        userId={this.state.userId} /> :  
                        <Redirect to={'/photos/' + props.match.params.userId} /> :
                        <Redirect to='/login-register' /> }
                    />
                    <Route exact path="/users" 
                      render={ props => this.state.userIsLoggedIn ? <UserList {...props} /> :
                      <Redirect to='/login-register' /> }
                    />
                    <Route exact path="/comments/:userId"
                      render={ props => this.state.userIsLoggedIn ? <UserComments {...props} setView={ this.setView.bind(this) } /> :
                      <Redirect to='/login-register' /> }
                    />
                    <Route exact path="/settings"
                      render={ props => this.state.userIsLoggedIn ? <UserSettings {...props} setView={ this.setView.bind(this) } 
                      setLoginStatus={ this.setLoginStatus.bind(this) } /> :
                      <Redirect to='/login-register' /> }
                    />
                    <Route exact path="/login-register" render={ props => <LoginRegister {...props} setLoginStatus={ this.setLoginStatus.bind(this) } />} />
                    {/* {
                      this.state.userIsLoggedIn ? <Route exact path="/" 
                      render={ props =>  <UserDetail {...props} setView={ this.setView.bind(this) } /> }
                      /> : <Redirect to='/login-register' />
                    }
                    {
                      this.state.userIsLoggedIn ? <Route exact path="/users/:userId"
                      render={ props => <UserDetail {...props} setView={ this.setView.bind(this) } /> }
                      /> : <Redirect to='/login-register' />
                    }
                    {
                      this.state.userIsLoggedIn ? <Route exact path="/photos/:userId"
                      render={ props => this.state.advancedFeatures ? <Redirect to={'/photos/' + props.match.params.userId + '/photo/0'} /> : <UserPhotos {...props} setView={ this.setView.bind(this) } /> }
                      /> : <Redirect to='/login-register' />
                    }
                    {
                      this.state.userIsLoggedIn ? <Route exact path="/photos/:userId/photo/:photoNumber"
                      render={ props => this.state.advancedFeatures ? <PhotoStepper {...props} setView={ this.setView.bind(this) }  /> :  <Redirect to={'/photos/' + props.match.params.userId} /> }
                      /> : <Redirect to='/login-register' />
                    }
                    {
                      this.state.userIsLoggedIn ? <Route exact path="/users" 
                      render={ props => <UserList {...props} /> } 
                      /> : <Redirect to='/login-register' /> 
                    }
                    {
                      this.state.userIsLoggedIn ? <Route exact path="/comments/:userId"
                      render={ props => <UserComments {...props} setView={ this.setView.bind(this) } /> }
                      /> : <Redirect to='/login-register' /> 
                    } */}
                  </Switch>
              </Paper>
            </Grid>
          </Grid>
          </div>
        </HashRouter>
      </ViewContext.Provider>
      
    );
  }
  
  componentDidMount() {
    console.log('mount')
    axios.get('/admin/status').then((response) => {
      this.setState({ 
        userIsLoggedIn: response.data.is_loggedin, 
        userFirstName: response.data.first_name,
        userId: response.data.user_id });
    }).catch((error) => {
      console.log(error);
    })
  }

  componentDidUpdate(prevProps, prevState) {    
    if (this.state.userIsLoggedIn !== prevState.userIsLoggedIn) {
      axios.get('/user/info').then((response) => {
        this.setState({ commentOfUserModel: response.data });
      }).catch((error) => {
        console.log(error);
      })
    }
  }

  // componentDidUpdate() {
  //   console.log('update')
  //   axios.get('/admin/status').then((response) => {
  //     if (response.data.is_loggedin !== this.state.userIsLoggedIn) {
  //       this.setState({ userIsLoggedIn: response.data.is_loggedin });
  //     }
  //   }).catch((error) => {
  //     console.log(error);
  //   })
  // }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
