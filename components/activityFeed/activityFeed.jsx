import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Avatar,
  Grid,
  IconButton
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { withStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const styles = {
  sectionContainer: {
    height: '100%',
    width: '100%',
    overflowY: 'auto',
  },
  activityBox: {
    paddingTop: '15px',
    paddingBottom: '15px',
    alignItems: 'center'
  },
  activityAvatarGrid: {
    width: '10%',
    display: 'flex',
    justifyContent: 'center',
  },
  activityContentGrid: {
    width: '90%'
  },
  refreshIcon: {
    // position: 'fixed',
    // height: '5%',
    display: 'flex',
    justifyContent: 'center',
  }, 
  // activitiesContainer: {
  //   height: '95%'
  // }
}

class ActivityFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activityModel: [],
      photoOfUserInfo: []
    }
  }

  handleRefresh() {
    axios.get('/activities').then((response) => {
      this.setState({ activityModel: response.data });
    }).catch((error) => {
      console.log(error);
    })
    axios.get('/photosOfUser/info').then((response) => {
      this.setState({ photoOfUserInfo: response.data })
    }).catch((error) => {
      console.log(error);
    })
  }

  render() {
    const { classes } = this.props;
    return (
      <Box className={classes.sectionContainer}>
        <Box className={classes.refreshIcon}>
          <IconButton color='primary' size='medium' onClick={ this.handleRefresh.bind(this) }>
            <RefreshIcon/>
          </IconButton>
        </Box>
        <Divider/>
        <Box className={classes.activitiesContainer}>
          {this.state.activityModel.map((x) => {
            if (x.activity === 'new comment') {
              return (
                <Box key={x._id}>
                  <Grid container className={classes.activityBox}>
                    <Grid item className={classes.activityAvatarGrid}>
                      <Avatar variant='square' src={'../../images/' + x.file_name} className={classes.activityAvatar} 
                      component={RouterLink} 
                      to={'/photos/' + x.photo_user_id + '/photo/' + 
                      (this.state.photoOfUserInfo[x.photo_user_id] && 
                      this.state.photoOfUserInfo[x.photo_user_id].indexOf(x.photo_id))}/>
                    </Grid>
                    <Grid item className={classes.activityContentGrid}>
                      <Typography>
                        <Typography component={RouterLink} to={'/users/' + x.user_id} color='primary'>
                          {x.first_name} {x.last_name}
                        </Typography> commented: </Typography>
                      <Typography>{x.comment}</Typography>
                      <Typography variant='overline'>{new Date(x.date_time).toLocaleString('en-US')}</Typography>
                    </Grid>
                  </Grid>
                  <Divider/>
                </Box>
              )
          } else if (x.activity === 'new photo') {
            return  (
              <Box key={x._id}>
                <Grid container className={classes.activityBox}>
                  <Grid item className={classes.activityAvatarGrid}>
                    <Avatar variant='square' src={'../../images/' + x.file_name} className={classes.activityAvatar} 
                    component={RouterLink} 
                    to={'/photos/' + x.photo_user_id + '/photo/' + 
                    (this.state.photoOfUserInfo[x.photo_user_id] && 
                    this.state.photoOfUserInfo[x.photo_user_id].indexOf(x.photo_id))}/>
                  </Grid>
                  <Grid item className={classes.activityContentGrid}>
                    <Typography>
                      <Typography component={RouterLink} to={'/users/' + x.user_id} color='primary'>
                        {x.first_name} {x.last_name}
                      </Typography> uploaded a new photo. Check it out! </Typography>
                    <Typography variant='overline'>{new Date(x.date_time).toLocaleString('en-US')}</Typography>
                  </Grid>
                </Grid>
                <Divider/>
              </Box>
            )
          } else if (x.activity === 'new login') {
            return (
              <Box key={x._id}>
                <Box className={classes.activityBox}>
                  <Typography>
                    <Typography component={RouterLink} to={'/users/' + x.user_id} color='primary'>
                      {x.first_name} {x.last_name}
                    </Typography> logged in.
                  </Typography>
                  <Typography variant='overline'>{new Date(x.date_time).toLocaleString('en-US')}</Typography>
                </Box>
                <Divider/>
              </Box>
            )
          } else if (x.activity === 'new logout') {
            return (
              <Box key={x._id}>
                <Box className={classes.activityBox}>
                  <Typography>
                    <Typography component={RouterLink} to={'/users/' + x.user_id} color='primary'>
                      {x.first_name} {x.last_name}
                    </Typography> logged out.
                  </Typography>
                  <Typography variant='overline'>{new Date(x.date_time).toLocaleString('en-US')}</Typography>
                </Box>
                <Divider/>
              </Box>
            )
          } else if (x.activity === 'new user') {
            return (
              <Box key={x._id}>
                <Box className={classes.activityBox}>
                  <Typography>
                    <Typography component={RouterLink} to={'/users/' + x.user_id} color='primary'>
                      {x.first_name} {x.last_name}
                    </Typography> just joined. Say hi!
                  </Typography>
                  <Typography variant='overline'>{new Date(x.date_time).toLocaleString('en-US')}</Typography>
                </Box>
                <Divider/>
              </Box>
            )
          } else if (x.activity === 'new like') {
            return (
              <Box key={x._id}>
                <Grid container className={classes.activityBox}>
                  <Grid item className={classes.activityAvatarGrid}>
                    <Avatar variant='square' src={'../../images/' + x.file_name} className={classes.activityAvatar} 
                    component={RouterLink} 
                    to={'/photos/' + x.photo_user_id + '/photo/' + 
                    (this.state.photoOfUserInfo[x.photo_user_id] && 
                    this.state.photoOfUserInfo[x.photo_user_id].indexOf(x.photo_id))}/>
                  </Grid>
                  <Grid item className={classes.activityContentGrid}>
                    <Typography>
                      <Typography component={RouterLink} to={'/users/' + x.user_id} color='primary'>
                        {x.first_name} {x.last_name}
                      </Typography> liked the photo. </Typography>
                    <Typography variant='overline'>{new Date(x.date_time).toLocaleString('en-US')}</Typography>
                  </Grid>
                </Grid>
                <Divider/>
              </Box>
            )
        }
        })}
        </Box>
      </Box>
    )
  }

  componentDidMount() {
    this.props.setView('Activities Feed');
    axios.get('/activities').then((response) => {
      this.setState({ activityModel: response.data });
    }).catch((error) => {
      console.log(error);
    })
    axios.get('/photosOfUser/info').then((response) => {
      this.setState({ photoOfUserInfo: response.data })
    }).catch((error) => {
      console.log(error);
    })
  }
}

export default withStyles(styles)(ActivityFeed);