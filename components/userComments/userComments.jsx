import React from 'react';
import {
  Typography,
  Box,
  Avatar,
  Card,
  CardContent,
  CardActionArea
} 
from '@material-ui/core';
import MoodBadIcon from '@material-ui/icons/MoodBad';
import { withStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import './userComments.css';

const styles = {
  sectionContainer: {
    height: '100%',
    width: '100%',
    overflowY: 'auto',
    overflowX: 'auto'
  },
  messageBox: {
    textAlign: 'center'
  }
};


/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserComments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: props.match.params.userId,
      userModel: {},
      commentOfUserModel: [],
      photoOfUserInfo: []
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Box className={classes.sectionContainer}>
        {this.state.commentOfUserModel.length === 0 ? <Box className={classes.messageBox}>
          <Typography>This user hasn&rsquo;t posted any comments yet.</Typography>
          <MoodBadIcon />
        </Box> : this.state.commentOfUserModel.map((x) => (
            <Card variant='outlined' key={x._id} className={classes.commentContainer}>
              <CardActionArea component={RouterLink} to={'/photos/' + x.photo_user_id + '/photo/' + 
                (this.state.photoOfUserInfo[x.photo_user_id] && 
                this.state.photoOfUserInfo[x.photo_user_id].indexOf(x.photo_id))}>
              <CardContent>
                <Avatar src={'../../images/' + x.photo_file_name }/>
                <Typography display='block' variant='overline'>{new Date(x.date_time).toLocaleString('en-US')}</Typography>
                <Typography>{x.comment}</Typography>
              </CardContent>
              </CardActionArea>
            </Card>
          ))
          }
      </Box>
    );
  }

  componentDidMount() {
    axios.get('/user/' + this.state.userId).then((response) => {
      this.setState({ userModel: response.data });
      var userInfo = this.state.userModel;
      this.props.setView('Comments posted by ' + userInfo.first_name + ' ' + userInfo.last_name);
    }).catch((error) => {
      console.log(error);
    })
    axios.get('/commentsOfUser/' + this.state.userId).then((response) => {
      this.setState({ commentOfUserModel: response.data });
    }).catch((error) => {
      console.log(error);
    })
    axios.get('/photosOfUser/info').then((response) => {
      this.setState({ photoOfUserInfo: response.data })
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
        var userInfo = this.state.userModel;
        this.props.setView('Comments posted by ' + userInfo.first_name + ' ' + userInfo.last_name);
      }).catch((error) => {
        console.log(error);
      })
      axios.get('/commentsOfUser/' + newUserId).then((response) => {
        this.setState({ commentOfUserModel: response.data });
      }).catch((error) => {
        console.log(error);
      })
    }
  }

  componentWillUnmount() {
    this.props.setView(undefined);
  }
}

export default withStyles(styles)(UserComments);
