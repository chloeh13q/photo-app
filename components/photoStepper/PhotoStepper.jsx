import React from 'react';
import {
  Typography,
  Box,
  Grid,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} 
from '@material-ui/core';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import MoodBadIcon from '@material-ui/icons/MoodBad';
import DeleteIcon from '@material-ui/icons/Delete';
import { withStyles } from '@material-ui/core/styles';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import './PhotoStepper.css';

const styles = {
  sectionContainer: {
    height: '100%',
    width: '100%',
    overflowY: 'auto',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoGridItem: {
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    maxWidth: '100%',
    maxHeight: '400px'
  },
  photoArrows: {
    textAlign: 'center'
  },
  messageBox: {
    textAlign: 'center'
  },
  addCommentButton: {
    marginTop: 10,
    marginBottom: 10,
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
class PhotoStepper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: props.match.params.userId,
      photoNumber: parseInt(props.match.params.photoNumber),
      userModel: {},
      photoOfUserModel: [],
      openNewCommentDialog: false,
      newCommentPhotoId: undefined,
      newCommentField: '',
      openDeleteCommentDialog: false,
      deleteCommentPhotoId: undefined,
      deleteCommentCommentId: undefined,
      openDeletePhotoDialog: false,
      deletePhotoPhotoId: undefined
    }
  }

  handleOpenNewCommentDialog(event, photoId) {
    this.setState({ newCommentPhotoId: photoId, openNewCommentDialog: true })
  }

  handleCloseNewCommentDialog() {
    this.setState({ newCommentPhotoId: undefined, openNewCommentDialog: false })
  }

  handleCommentFieldChange(event) {
    this.setState({ newCommentField: event.target.value })
  }

  handleSubmitComment(event) {
    axios.post('/commentsOfPhoto/' + this.state.newCommentPhotoId, {
      comment: this.state.newCommentField
    }).then(() => {
      this.setState({ 
        openNewCommentDialog: false,
        newCommentPhotoId: undefined,
        newCommentField: ''
       })
       axios.get('/photosOfUser/' + this.state.userId).then((response) => {
        this.props.updateCommentModel();
        this.setState({ photoOfUserModel: response.data });
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
        this.props.history.push('/photos/' + this.state.userId + '/photo/' + Math.max(this.state.photoNumber - 1, 0))
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
    let currentPhoto = userPhotos[this.state.photoNumber] || {};
    return (
      <React.Fragment>
        {this.state.photoOfUserModel.length === 0 ? 
        <Box className={classes.noPhotosMessageBox}>
          <Typography>This user hasn&rsquo;t posted any photos yet.</Typography>
          <MoodBadIcon />
        </Box> : (this.state.photoNumber < 0 || this.state.photoNumber >= this.state.photoOfUserModel.length) ? <Box className={classes.messageBox}>
          <Typography>Photo doesn&rsquo;t exist!</Typography>
          <MoodBadIcon />
        </Box> : 
        <Box className={classes.sectionContainer}>
          <Grid container className={classes.photoContainer}>
            <Grid item sm={1} className={classes.photoArrows}>
              {this.state.photoNumber === 0 ? <IconButton disabled aria-label="arrow-left">
                <ArrowLeftIcon fontSize='large' />
              </IconButton> : <IconButton aria-label="arrow-left" component={RouterLink} to={'/photos/' + this.state.userId + '/photo/' + (this.state.photoNumber - 1).toString()}>
                <ArrowLeftIcon fontSize='large' />
              </IconButton>}
            </Grid>
            <Grid item sm={10} className={classes.photoGridItem}>
              <Box>
                {currentPhoto.file_name && <img src={'../../images/' + currentPhoto.file_name} className={classes.photo} />}
              </Box>
            </Grid>
            <Grid item sm={1} className={classes.photoArrows}>
              {this.state.photoNumber < userPhotos.length - 1 ? <IconButton aria-label="arrow-right" component={RouterLink} to={'/photos/' + this.state.userId + '/photo/' + (this.state.photoNumber + 1).toString()} >
                <ArrowRightIcon fontSize='large' />
              </IconButton> : <IconButton disabled aria-label="arrow-right">
                <ArrowRightIcon fontSize='large' />
              </IconButton>}
            </Grid>
          </Grid>
          <Grid container className={classes.iconsRow}>
            <Grid item sm={11} className={classes.favoriteAndCommentIcons}>
              {
                currentPhoto.likes.includes(this.props.userId) ? <IconButton color='primary' size='small'
                onClick={ this.handleUnlikePhoto.bind(this, currentPhoto._id) } >
                <FavoriteIcon />
                </IconButton> : <IconButton color='primary' size='small'
                onClick={ this.handleLikePhoto.bind(this, currentPhoto._id)} >
                  <FavoriteBorderIcon />
                </IconButton>
              }
              <Typography display='inline' color='primary' variant='body1'>{currentPhoto.likes.length}</Typography>
              <IconButton color='primary' size='small' className={classes.commentIcon} 
              onClick={ (event) => this.handleOpenNewCommentDialog(event, currentPhoto._id) }>
                <ChatBubbleOutlineIcon/>
              </IconButton>
            </Grid>
            <Grid item sm={1} className={classes.deleteIcon}>
            {
              currentPhoto.user_id === this.props.userId ?
              <IconButton color='primary' size='small' onClick={ this.handleOpenDeletePhotoDialog.bind(this, currentPhoto._id) }>
                <DeleteIcon/>
              </IconButton> : null
            }
            </Grid>
          </Grid>
          <Box className={classes.imageInfo}>
            <Typography variant='overline' display='block'>Posted at {new Date(currentPhoto.date_time).toLocaleString('en-US')}</Typography>
          </Box>
          <Divider />
          <Grid container className={classes.commentContainer}>
            <Grid item sm={12}>
              <Typography variant='h6'>Comments</Typography>
                {/* <Button size='small' variant='outlined' color='primary' startIcon={<AddCircleIcon />} 
                  className={classes.addCommentButton}
                  onClick={ (event) => this.handleOpenNewCommentDialog(event, currentPhoto._id) }>Add comment</Button> */}
                  <Dialog fullWidth open={this.state.openNewCommentDialog}
                  onClose={ (event) => this.handleCloseNewCommentDialog(event) } aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">New comment</DialogTitle>
                    <DialogContent>
                      <TextField multiline rows={4} rowsMax={4} variant='outlined' fullWidth 
                      defaultValue={this.state.newCommentField}
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
                {currentPhoto.comments && currentPhoto.comments.map((y, idx) => (
                  // <Box key={idx}>
                  //     <Typography component={RouterLink} to={'/users/' + y.user._id} color='primary'>{y.user.first_name} {y.user.last_name}</Typography> 
                  //     <Typography variant='overline'> {new Date(y.date_time).toLocaleString('en-US')}</Typography>
                  //     <Typography>{y.comment}</Typography>
                  // </Box>
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
                          <IconButton color='primary' size='small' onClick={ this.handleOpenDeleteCommentDialog.bind(this, currentPhoto._id, y._id) }>
                            <DeleteIcon/>
                          </IconButton> : null
                        }
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider />
                </React.Fragment>
                  ))}
            </Grid>
          </Grid>
        </Box>
        }
      </React.Fragment>

    );
  }

  componentDidMount() {
    axios.get('/user/' + this.state.userId).then((response) => {
      this.setState({ userModel: response.data });
      var userInfo = this.state.userModel;
      this.props.setView('Photos of ' + userInfo.first_name + ' ' + userInfo.last_name);
    }).catch((error) => {
      console.log(error);
    })
    axios.get('/photosOfUser/' + this.state.userId).then((response) => {
      this.setState({ photoOfUserModel: response.data });
    }).catch((error) => {
      console.log(error);
    })
  }

  componentDidUpdate(prevProps, prevState) {
    let newPhotoNumber = parseInt(this.props.match.params.photoNumber);
    let newUserId = this.props.match.params.userId;
    if (newPhotoNumber !== prevState.photoNumber) {
      this.setState({ photoNumber: newPhotoNumber })
    }
    if (newUserId !== prevState.userId) {
      axios.get('/user/' + newUserId).then((response) => {
        this.setState({ userModel: response.data });
        var userInfo = this.state.userModel;
        this.props.setView('Photos of ' + userInfo.first_name + ' ' + userInfo.last_name);
      }).catch((error) => {
        console.log(error);
      })
      axios.get('/photosOfUser/' + newUserId).then((response) => {
        this.setState({ photoOfUserModel: response.data });
      }).catch((error) => {
        console.log(error);
      })
    }
  }

  componentWillUnmount() {
    this.props.setView(undefined);
  }
}

export default withStyles(styles)(PhotoStepper);
