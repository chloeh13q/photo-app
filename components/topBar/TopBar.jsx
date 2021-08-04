import React from 'react';
import {
  AppBar, Toolbar, Typography, Box, FormControlLabel, Checkbox, withStyles, Button, Grid, MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ClickAwayListener,
  Popper,
  MenuList,
  Grow,
  Paper,
  IconButton
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import MenuIcon from '@material-ui/icons/Menu';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import { Link as RouterLink } from 'react-router-dom';
import grey from '@material-ui/core/colors/grey';
import axios from 'axios';
import './TopBar.css';

/**
 * Define TopBar, a React componment of CS142 project #5
 */

const styles = {
  topbarForm: {
    marginRight: '0px',
  },
  logout: {
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  advancedCheckGrid: {
    justifyContent: 'flex-end'
  },
  input: {
    display: 'none'
  },
  alert: {
    marginBottom: '10px',
    marginTop: '-5px'
  }
}

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: undefined,
      openPhotoDialog: false,
      selectedFileName: '',
      submitFailure: false,
      submitSuccess: false,
      openMenu: false,
    }
  }

  handleLogout() {
    axios.post('/admin/logout').then(() => {
      this.props.setLoginStatus(false, undefined, undefined);
      this.setState({ openMenu: false });
    }).catch((error) => {
      if (error.response && error.response.status === 400) {
        console.log(error.response);
      } else {
        console.log(error);
      }
    })
  } 

  handleToggleMenu() {
    this.setState(prevState => ({
      openMenu: !prevState.openMenu
    }))
  }

  handleCloseMenu() {
    this.setState({ openMenu: false })
  }

  handleOpenDialog() {
    this.setState({ openPhotoDialog: true, openMenu: false })
  }

  handleCloseDialog() {
    this.setState({ 
      openPhotoDialog: false,
      selectedFileName: '',
      submitFailure: false,
      submitSuccess: false
     })
  }

  handleSelectFile(event) {
    this.setState({ selectedFileName: event.target.files[0] && event.target.files[0].name })
  }

  // this function is called when user presses the submit button
  handleSubmitPhoto = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios.post('/photos/new', domForm)
        .then(() => {
          this.setState({ submitFailure: false, submitSuccess: true });
        })
        .catch(err => {
          console.log(`POST ERR: ${err}`)
          this.setState({ submitFailure: true, submitSuccess: false });
        });
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar className='cs142-topbar-toolbar'>
          <Typography variant="h5" color="inherit">
              Chloe He <Typography variant='overline' display='block' className='cs142-topbar-version' align='left'>version {this.state.version}</Typography>
          </Typography>
          
          {this.props.userIsLoggedIn ? 
          <React.Fragment>
            <Typography display='block' variant='h6' align='center'>{this.props.viewMode} </Typography>
            <Box>
              <Grid container className={classes.advancedCheckGrid}>
                <Grid>
                  <FormControlLabel control={
                    <Checkbox size='small' name="advancedCheck" color="secondary" 
                    onChange={this.props.toggleFeatures} 
                    checked={this.props.advancedFeatures} />
                  } label={<Typography component='span' variant='button' align='right'>Enable Advanced Features</Typography>}
                  className={classes.topbarForm} />
                </Grid>
              </Grid>
              <Grid container alignItems="flex-end" className={classes.logout}>
                <Grid item>
                  <Typography variant='subtitle1' align='right'>Hello {this.props.userFirstName}&nbsp;&nbsp;&nbsp;</Typography>
                </Grid>
                <Grid item>
                  <IconButton component={RouterLink} to='/'><RssFeedIcon style={{ color: grey[50] }} /></IconButton>
                </Grid>
                <Grid>
                  <IconButton
                    aria-controls={this.state.openMenu ? 'menu-list-grow' : undefined}
                    aria-haspopup="true"
                    buttonRef={node => {
                      this.anchorEl = node;
                    }}
                    onClick={ this.handleToggleMenu.bind(this) }
                  >
                    <MenuIcon style={{ color: grey[50] }}/>
                  </IconButton>
                  <Popper open={this.state.openMenu} anchorEl={this.anchorEl} role={undefined} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                      >
                        <Paper>
                          <ClickAwayListener onClickAway={ this.handleCloseMenu.bind(this) }>
                            <MenuList autoFocusItem={this.state.openMenu} id="menu-list-grow">
                              <MenuItem onClick={ this.handleOpenDialog.bind(this) }>Add photo</MenuItem>
                              <MenuItem onClick={ this.handleCloseMenu.bind(this) } component={RouterLink} to={'/settings'}>Settings</MenuItem>
                              <MenuItem onClick={ this.handleLogout.bind(this) }>Logout</MenuItem>
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                  <Dialog fullWidth open={this.state.openPhotoDialog}
                  onClose={ (event) => this.handleCloseDialog(event) } aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">New photo</DialogTitle>
                    <DialogContent>
                      {
                        this.state.submitSuccess ? <Alert severity="success" className={classes.alert}>
                        Photo successfully uploaded!
                        </Alert> : null
                      }
                      {
                        this.state.submitFailure ? <Alert severity="error" className={classes.alert}>
                        Error! Please try again.
                      </Alert> : null
                      }
                      <input accept="image/*" className={classes.input} id="upload-photo-button" multiple type="file" 
                      ref={(domFileRef) => { this.uploadInput = domFileRef; }}
                      onChange={ (event) => this.handleSelectFile(event)} />
                      <label htmlFor="upload-photo-button">
                        <Button color="primary" component="span" startIcon={<PhotoCamera color='primary'
                        onClick={ (event) => this.handleOpenDialog(event) } />}>Select photo</Button>
                      </label>
                      <Typography variant='body1'>
                        {this.state.selectedFileName}
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      { this.state.submitSuccess ? 
                      <Button onClick={ (event) => this.handleCloseDialog(event) } color="primary">
                        Done
                      </Button> : <React.Fragment>
                      <Button onClick={(event) => this.handleSubmitPhoto(event)} color="primary">
                        Submit
                      </Button>
                      <Button onClick={ (event) => this.handleCloseDialog(event) } color="primary">
                        Cancel
                      </Button>
                      </React.Fragment> }
                    </DialogActions>
                  </Dialog>
                </Grid>
              </Grid>
            </Box>
          </React.Fragment>
           : 
          <Typography display='block' variant='subtitle1' align='right'>Please Login</Typography>}
        </Toolbar>
      </AppBar>
    );
  }

  componentDidMount() {
    axios.get('/test/info').then((response) => {
      this.setState({ version: response.data.__v })
    }).catch((error) => {
      console.log(error)
    })
  }

  componentDidUpdate() {
    if (this.state.version === undefined) {
      axios.get('/test/info').then((response) => {
        this.setState({ version: response.data.__v })
      }).catch((error) => {
        console.log(error)
      })
    }
  }
}

export default withStyles(styles)(TopBar);
