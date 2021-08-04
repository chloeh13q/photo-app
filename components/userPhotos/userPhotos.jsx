import React from 'react';
import {
  Typography,
  Divider,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  FormControlLabel,
  Checkbox
} 
from '@material-ui/core';
import MoodBadIcon from '@material-ui/icons/MoodBad';
import { withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { Link as RouterLink } from 'react-router-dom';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import axios from 'axios';
import './userPhotos.css';

const styles = {
  sectionContainer: {
    height: '100%',
    width: '100%',
    overflowY: 'auto',
    overflowX: 'auto'
  },
  sortCheckbox: {
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: '5px'
  },
  sortTypography: {
    marginRight: '10px'
  },
  photoContainer: {
    marginBottom: 80,
  },
  addCommentButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  photo: {
    width: '80%'
  },
  commentContainer: {
    paddingTop: '5px',
    paddingBottom: '5px',
  },
  commentContentContainer: {
    justifyContent: 'space-between'
  },
  comment: {
    display: 'flex',
    alignItems: 'center'
  },
  commentIcon: {
    marginLeft: '10px'
  },
  iconsRow: {
    marginTop: '5px'
  },
  favoriteAndCommentIcons: {
    display: 'flex',
    alignItems: 'center'
  },
  deleteIcon: {
    // marginRight: '15px'
    textAlign: 'center'
  },
  imageInfoContainer: {
    paddingTop: '5px',
    paddingBottom: '5px',
  },
  imageInfo: {
    // justifyContent: 'space-between',
    marginTop: '5px',
    marginBottom: '5px'
  },
  noPhotosMessageBox: {
    textAlign: 'center'
  }
};


/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: props.match.params.userId,
      userModel: {},
      photoOfUserModel: [],
      firstPhotoId: '',
      openNewCommentDialog: false,
      newCommentPhotoId: undefined,
      newCommentField: [],
      openDeleteCommentDialog: false,
      deleteCommentPhotoId: undefined,
      deleteCommentCommentId: undefined,
      openDeletePhotoDialog: false,
      deletePhotoPhotoId: undefined,
    }
  }

  handleOpenNewCommentDialog(event, photoId) {
    this.setState({ newCommentPhotoId: photoId, openNewCommentDialog: true });
  }

  handleCloseNewCommentDialog() {
    this.setState({ newCommentPhotoId: undefined, openNewCommentDialog: false });
  }

  handleCommentFieldChange(event) {
    var stateCopy = Object.assign({}, this.state.newCommentField);
    stateCopy[this.state.newCommentPhotoId] = event.target.value;
    this.setState({ newCommentField: stateCopy });
  }

  handleSubmitComment(event) {
    axios.post('/commentsOfPhoto/' + this.state.newCommentPhotoId, {
      comment: this.state.newCommentField[this.state.newCommentPhotoId]
    }).then(() => {
      this.props.updateCommentModel();
      this.setState({ 
        openNewCommentDialog: false,
        newCommentPhotoId: undefined,
        newCommentField: []
       });
       axios.get('/photosOfUser/' + this.state.userId).then((response) => {
        this.setState({ photoOfUserModel: response.data, firstPhotoId: response.data[0]._id });
      }).catch((error) => {
        console.log(error);
      })
    }).catch((error) => {
      console.log(error);
    })
    event.preventDefault();
  }

  handleOpenDeleteCommentDialog(photoId, commentId) {
    this.setState({ openDeleteCommentDialog: true, deleteCommentPhotoId: photoId, deleteCommentCommentId: commentId })
  }

  handleCloseDeleteCommentDialog() {
    this.setState({ openDeleteCommentDialog: false, deleteCommentPhotoId: undefined, deleteCommentCommentId: undefined })
  }

  handleSubmitDeleteComment() {
    axios.delete('/comment', {
      data: {
        photo_id: this.state.deleteCommentPhotoId,
        comment_id: this.state.deleteCommentCommentId
      }
    }).then(() => {
      this.props.updateCommentModel();
      this.setState({
        openDeleteCommentDialog: false, deleteCommentPhotoId: undefined, deleteCommentCommentId: undefined
      });
      axios.get('/photosOfUser/' + this.state.userId).then((response) => {
        this.setState({ photoOfUserModel: response.data });
      }).catch((error) => {
        console.log(error);
      })
    }).catch((error) => {
      console.log(error);
    })
  }

  handleOpenDeletePhotoDialog(photoId) {
    console.log(photoId)
    this.setState({ openDeletePhotoDialog: true, deletePhotoPhotoId: photoId })
  }

  handleCloseDeletePhotoDialog() {
    this.setState({ openDeletePhotoDialog: false, deletePhotoPhotoId: undefined })
  }

  handleSubmitDeletePhoto() {
    axios.delete('/photo', {
      data: {
        photo_id: this.state.deletePhotoPhotoId,
      }
    }).then(() => {
      this.props.updateCommentModel();
      this.setState({
        openDeletePhotoDialog: false, deletePhotoPhotoId: undefined
      });
      axios.get('/photosOfUser/' + this.state.userId).then((response) => {
        this.setState({ photoOfUserModel: response.data });
      }).catch((error) => {
        console.log(error);
      })
    }).catch((error) => {
      console.log(error);
    })
  }

  handleLikePhoto(photoId) {
    axios.post('/like', {
      photo_id: photoId
    }).then(() => {
      axios.get('/photosOfUser/' + this.state.userId).then((response) => {
        this.setState({ photoOfUserModel: response.data });
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    })
  }

  handleUnlikePhoto(photoId) {
    axios.delete('/like', {
      data: {
        photo_id: photoId
      }
    }).then(() => {
      axios.get('/photosOfUser/' + this.state.userId).then((response) => {
        this.setState({ photoOfUserModel: response.data });
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    })
  }

  render() {
    const { classes } = this.props;
    let userPhotos = this.state.photoOfUserModel;
    return (
      <Box className={classes.sectionContainer}>
        <Dialog fullWidth open={this.state.openNewCommentDialog}
        onClose={ (event) => this.handleCloseNewCommentDialog(event) } aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">New comment</DialogTitle>
          <DialogContent>
            <TextField multiline rows={4} rowsMax={4} variant='outlined' fullWidth value={this.state.newCommentField[this.state.newCommentPhotoId]}
            onChange={ (event) => this.handleCommentFieldChange(event) }/>
          </DialogContent>
          <DialogActions>
            <Button onClick={(event) => this.handleSubmitComment(event)} color="primary">
              Submit
            </Button>
            <Button onClick={ (event) => this.handleCloseNewCommentDialog(event) } color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog fullWidth open={this.state.openDeletePhotoDialog}
        onClose={ (event) => this.handleCloseDeletePhotoDialog(event) } aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Are you sure you want to delete your photo?</DialogTitle>
          <DialogContent>
            <Typography>This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={ (event) => this.handleCloseDeletePhotoDialog(event) } color="primary">
              Cancel
            </Button>
            <Button color='secondary' 
            onClick={(event) => this.handleSubmitDeletePhoto(event)} className={classes.dialogDeleteButton}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog fullWidth open={this.state.openDeleteCommentDialog}
        onClose={ (event) => this.handleCloseDeleteCommentDialog(event) } aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Are you sure you want to delete your comment?</DialogTitle>
          <DialogContent>
            <Typography>This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={ (event) => this.handleCloseDeleteCommentDialog(event) } color="primary">
              Cancel
            </Button>
            <Button color='secondary' 
            onClick={(event) => this.handleSubmitDeleteComment(event)} className={classes.dialogDeleteButton}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        {userPhotos.length === 0 ? <Box className={classes.noPhotosMessageBox}>
          <Typography>This user hasn&rsquo;t posted any photos yet.</Typography>
          <MoodBadIcon />
        </Box> : <Box>
          <FormControlLabel control={
            <Checkbox size='small' name="sortByLikes" color="secondary" />
          } label={<Typography component='span' variant='subtitle1'
          align='right' className={classes.sortTypography}>Sort by likes</Typography>} 
          className={classes.sortCheckbox}
          onChange={ this.props.toggleSortCheckbox }
          checked={false}/>
          {
            userPhotos.map((x) => (
              <Box key={x._id} className={classes.photoContainer}>
                <Box className={classes.imageInfoContainer}>
                  <img src={'../../images/' + x.file_name} className={classes.photo} />
                  <Grid container className={classes.iconsRow}>
                    <Grid item sm={11} className={classes.favoriteAndCommentIcons}>
                      {
                        x.likes.includes(this.props.userId) ? <IconButton color='primary' size='small'
                        onClick={ this.handleUnlikePhoto.bind(this, x._id) } >
                        <FavoriteIcon />
                        </IconButton> : <IconButton color='primary' size='small'
                        onClick={ this.handleLikePhoto.bind(this, x._id)} >
                          <FavoriteBorderIcon />
                        </IconButton>
                      }
                      <Typography display='inline' color='primary' variant='body1'>{x.likes.length}</Typography>
                      <IconButton color='primary' size='small' className={classes.commentIcon}
                      onClick={ (event) => this.handleOpenNewCommentDialog(event, x._id) }>
                        <ChatBubbleOutlineIcon/>
                      </IconButton>
                    </Grid>
                    <Grid item sm={1} className={classes.deleteIcon}>
                    {
                      x.user_id === this.props.userId ?
                      <IconButton color='primary' size='small' onClick={ this.handleOpenDeletePhotoDialog.bind(this, x._id) }>
                        <DeleteIcon/>
                      </IconButton> : null
                    }
                    </Grid>
                  </Grid>
                  <Box className={classes.imageInfo}>
                    <Typography variant='overline' display='block'>Posted at {new Date(x.date_time).toLocaleString('en-US')}</Typography>
                  </Box>
                </Box>
                <Divider />
                <Box className={classes.commentContainer}>
                  <Typography variant='h6'>Comments</Typography>
                  {/* <Button size='small' variant='outlined' color='primary' startIcon={<AddCircleIcon />} 
                  className={classes.addCommentButton}
                  onClick={ (event) => this.handleOpenNewCommentDialog(event, x._id) }>Add comment</Button> */}
                  {x.comments && x.comments.map((y, idx) => (
                    <React.Fragment key={idx}>
                      <Box className={classes.commentContainer}>
                        <Typography component={RouterLink} to={'/users/' + y.user._id} color='primary'>{y.user.first_name} {y.user.last_name}</Typography> 
                        <Typography variant='overline'> {new Date(y.date_time).toLocaleString('en-US')}</Typography>
                        <Grid container className={classes.commentContentContainer}>
                          <Grid item sm={11} className={classes.comment}>
                            <Typography>{y.comment}</Typography>
                          </Grid>
                          <Grid item sm={1} className={classes.deleteIcon}>
                            {
                              y.user._id === this.props.userId ?
                              <IconButton color='primary' size='small' onClick={ this.handleOpenDeleteCommentDialog.bind(this, x._id, y._id) }>
                                <DeleteIcon/>
                              </IconButton> : null
                            }
                          </Grid>
                        </Grid>
                      </Box>
                      <Divider />
                    </React.Fragment>
                    ))}
                  </Box>
              </Box>
            ))
          }
          </Box>}
      </Box>
    );
  }

  componentDidMount() {
    axios.get('/user/' + this.state.userId).then((response) => {
      this.setState({ userModel: response.data });
      var userInfo = this.state.userModel;
      this.props.setView('Photos of ' + userInfo.first_name + ' ' + userInfo.last_name);
    }).catch((error) => {
      console.log(error);
    });
    axios.get('/photosOfUser/' + this.state.userId).then((response) => {
      this.setState({ photoOfUserModel: response.data, firstPhotoId: response.data[0]._id });
    }).catch((error) => {
      console.log(error);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    let newUserId = this.props.match.params.userId;
    if (newUserId !== prevState.userId) {
      this.setState({ userId: newUserId })
      axios.get('/user/' + newUserId).then((response) => {
        this.setState({ userModel: response.data });
        var userInfo = this.state.userModel;
        this.props.setView('Photos of ' + userInfo.first_name + ' ' + userInfo.last_name);
      }).catch((error) => {
        console.log(error);
      })
      axios.get('/photosOfUser/' + newUserId).then((response) => {
        this.setState({ photoOfUserModel: response.data, firstPhotoId: response.data[0]._id });
      }).catch((error) => {
        console.log(error);
      })
    }
  }

  componentWillUnmount() {
    this.props.setView(undefined);
  }
}

export default withStyles(styles)(UserPhotos);
