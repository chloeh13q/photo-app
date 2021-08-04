import React from 'react';
import {
  Typography,
  Button,
  Box
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import './userDetail.css';

const styles = {
  sectionContainer: {
    height: '94%',
    overflowY: 'auto',
    overflowX: 'auto'
  },
  propContainer: {
    marginTop: 20,
  }
};

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: props.match.params.userId,
      userModel: {}
    }
  }

  render() {
    const { classes } = this.props;
    let userInfo = this.state.userModel;
    return (
      <Box className={classes.sectionContainer}>
        <Button variant='contained' color='primary' component={RouterLink} to={'/photos/' + userInfo._id}>Photos</Button>
        <Box className={classes.propContainer}>
          <Typography variant='button' display='block' color='primary'>Name: </Typography><Typography>{userInfo.first_name} {userInfo.last_name}</Typography>
          <Typography variant='button' display='block' color='primary'>Location: </Typography><Typography>{userInfo.location}</Typography>
          <Typography variant='button' display='block' color='primary'>Occupation: </Typography><Typography>{userInfo.occupation}</Typography>
          <Typography variant='button' display='block' color='primary'>Description: </Typography><Typography>{userInfo.description}</Typography>
        </Box>
      </Box>
    );
  }

  componentDidMount() {
    axios.get('/user/' + this.state.userId).then((response) => {
      this.setState({ userModel: response.data });
      let userInfo = this.state.userModel;
      this.props.setView(userInfo && userInfo.first_name + ' ' + userInfo.last_name);
    }).catch((error) => {
      console.log(error);
    })
  }

  componentDidUpdate(prevProps, prevState) {
    let newUserId = this.props.match.params.userId;
    if (newUserId !== prevState.userId) {
      this.setState({ userId: newUserId })
      axios.get('/user/' + newUserId).then((response) => {
        this.setState({ userModel: response.data });
        let userInfo = this.state.userModel;
        this.props.setView(userInfo && userInfo.first_name + ' ' + userInfo.last_name);
      }).catch((error) => {
        console.log(error);
      })
    }
  }

  componentWillUnmount() {
    this.props.setView(undefined);
  }
}

export default withStyles(styles)(UserDetail);
