import React from 'react';
import {
  TextField,
  Box,
  withStyles,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  DialogContentText
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import grey from '@material-ui/core/colors/grey';
import Alert from '@material-ui/lab/Alert';
import axios from 'axios';

const styles = {
  containerBox: {
    textAlign: 'center',
    height: '100%',
    overflowX: 'auto',
  },
  centerContainer: {
    justifyContent: 'center',
    marginTop: '15px',
  },
  inputGrid: {
    width: '30%'
  },
  submitButtonGrid: {
    width: '20%',
    marginTop: '30px',
    marginBottom: '20px'
  },
  loginPrompt: {
    marginTop: '3%'
  },
  registerFormContainer: {
    justifyContent: 'center',
    marginTop: '15px',
    flexDirection: 'column',
    textAlign: 'left'
  },
  registerFormGrid: {
    width: '50%'
  },
  registerFieldContainer: {
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  registerButtonGrid: {
    marginTop: '20px',
    marginBottom: '20px'
  },
  registerTextfield: {
    width: '60%'
  },
  registerAlert: {
    width: '100%',
    marginTop: '10px'
  }, 
  registerNote: {
    marginTop: '20px'
  },
  invalidLoginAlert: {
    width: '30%',
    textAlign: 'left'
  }
}

const BlackTextTypography = withStyles({
  root: {
    color: grey[900]
  }
})(Typography);

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginView: true,
      loginUsername: undefined,
      loginPassword: undefined,
      invalidLogin: false,
      diffPassword: false,
      invalidUsername: false,
      emptyPassword: false,
      emptyFirstName: false,
      emptyLastName: false,
      duplicateUsername: false,
      openRegisterSuccessDialog: false,
      openRegisterFailureDialog: false
    }
  }

  handleLoginUsernameChange(event) {
    this.setState({ loginUsername: event.target.value });
  }

  handleLoginPasswordChange(event) {
    this.setState({ loginPassword: event.target.value });
  }

  handleLogin(event) {
    event.preventDefault();
    axios.post('/admin/login', {
      login_name: this.state.loginUsername,
      password: this.state.loginPassword
    }).then((response) => {
      this.props.setLoginStatus(true, response.data.first_name, response.data._id);
      this.props.history.push('/users/' + response.data._id);
    }).catch((error) => {
      if (error.response && error.response.status === 400) {
        this.setState({ invalidLogin: true });
      } else {
        console.log(error);
      }
    })
  }

  handleClickLogin() {
    this.setState({ loginView: true })
  }

  handleClickRegister() {
    this.setState({ loginView: false, invalidLogin: false })
  }

  handleRegisterFormChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleRegister(event) {
    event.preventDefault();
    var post = true;
    if (this.state.password !== this.state.password_repeat) {
      post = false;
      this.setState({ diffPassword: true })
    } else {
      this.setState({ diffPassword: false })
    }
    var illegalChars = /\W/;
    if (this.state.username === undefined || this.state.username.length === 0 || illegalChars.test(this.state.username)) {
      post = false;
      this.setState({ invalidUsername: true })
    } else {
      this.setState({ invalidUsername: false })
    }
    if (this.state.password === undefined || this.state.password.length === 0) {
      post = false;
      this.setState({ emptyPassword: true })
    } else {
      this.setState({ emptyPassword: false })
    }
    if (this.state.first_name === undefined || this.state.first_name.length === 0) {
      post = false;
      this.setState({ emptyFirstName: true })
    } else {
      this.setState({ emptyFirstName: false })
    }
    if (this.state.last_name === undefined || this.state.last_name.length === 0) {
      post = false;
      this.setState({ emptyLastName: true })
    } else {
      this.setState({ emptyLastName: false })
    }
    if (post) {
      axios.post('/user', {
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        location: this.state.location || '',
        description: this.state.description || '',
        occupation: this.state.occupation || '',
        login_name: this.state.username,
        password: this.state.password
      }).then(() => {
        this.setState({ 
          duplicateUsername: false, 
          openRegisterSuccessDialog: true,
          username: '',
          password: '',
          password_repeat: '',
          first_name: '',
          last_name: '',
          location: '',
          description: '',
          occupation: '',
          loginView: true
         });
      }).catch((error) => {
        if (error.response.data === 'Username already exists.') {
          this.setState({ duplicateUsername: true });
        } else {
          console.log(error);
          this.setState({ openRegisterFailureDialog: true })
        }
      })
    }
  }

  handleCloseSuccessDialog() {
    this.setState({ openRegisterSuccessDialog: false })
  }

  handleCloseFailureDialog() {
    this.setState({ openRegisterFailureDialog: false })
  }

  render() {
    const { classes } = this.props;
    return (
      <Box className={classes.containerBox} color="primary.main">
        <Button size='large' onClick={() => this.handleClickLogin()}>Login</Button>
        <Button size='large' onClick={() => this.handleClickRegister()}>Register</Button>
        {this.state.loginView ? <Box>
          <Typography variant='body1' className={classes.loginPrompt}>Please log in to continue.</Typography>
        <Box>
          <div>
            <Grid container spacing={1} alignItems="flex-end" className={classes.centerContainer}>
              <Grid item>
                <AccountCircleIcon />
              </Grid>
              <Grid item className={classes.inputGrid}>
                <TextField id="input-username" label="Username" fullWidth onChange={ (event) => this.handleLoginUsernameChange(event) }/>
              </Grid>
            </Grid>
          </div>
          <div>
            <Grid container spacing={1} alignItems="flex-end" className={classes.centerContainer}>
              <Grid item>
                <VpnKeyIcon />
              </Grid>
              <Grid item className={classes.inputGrid}>
                <TextField id="input-password" label="Password" fullWidth type='password' 
                onChange={ (event) => this.handleLoginPasswordChange(event) } />
              </Grid>
            </Grid>
          </div>
          <div>
            <Grid container className={classes.centerContainer}>
              <Grid className={classes.submitButtonGrid}>
                <Button color='primary' variant='contained' size='large' fullWidth onClick={ (event) => this.handleLogin(event) }>Sign In</Button>
              </Grid>
            </Grid>
          </div>
          {this.state.invalidLogin ? <div><Grid container className={classes.centerContainer} >
          <Alert severity="error" className={classes.invalidLoginAlert}>Invalid username or password. Please try again.</Alert></Grid></div> 
          : null}
        </Box>
        </Box> : <Box>
          <Typography variant='body1' className={classes.loginPrompt}>Don&rsquo;t have an account? Register below.</Typography>
        <Box>
          <Box className={classes.registerNote}>
            <Typography color='secondary' display='inline'>*&nbsp;</Typography>
            <BlackTextTypography display='inline'>indicates a required field</BlackTextTypography>
          </Box>
          <Grid container spacing={1} alignItems="center" className={classes.registerFormContainer}>
            <Grid item className={classes.registerFormGrid}>
              <Grid container alignItems='center' className={classes.registerFieldContainer}>
                <Grid item>
                  <Typography color='secondary' display='inline'>*&nbsp;</Typography>
                  <BlackTextTypography display='inline'>Username</BlackTextTypography>
                </Grid>
                <Grid item className={classes.registerTextfield}>
                  <TextField variant='outlined' fullWidth required size='small' name='username' 
                  value={this.state.username || ''} onChange={ (event) => this.handleRegisterFormChange(event) } />
                </Grid>
              </Grid>
              {this.state.invalidUsername ? <Grid container alignItems='flex-end' >
                <Alert severity="error" className={classes.registerAlert}>Invalid username. Username must be non-empty and
                only contain letters, numbers, or underscore.</Alert></Grid> 
                : null}
              {this.state.duplicateUsername ? <Grid container alignItems='flex-end' >
                <Alert severity="error" className={classes.registerAlert}>Username already taken.</Alert></Grid> 
                : null}
              <Grid container alignItems='center' className={classes.registerFieldContainer}>
                <Grid item>
                  <Typography color='secondary' display='inline'>*&nbsp;</Typography>
                  <BlackTextTypography display='inline'>Password</BlackTextTypography>
                </Grid>
                <Grid item className={classes.registerTextfield}>
                  <TextField variant='outlined' fullWidth required size='small' type="password" name='password' 
                  value={this.state.password || ''} 
                  onChange={ (event) => this.handleRegisterFormChange(event) } />
                </Grid>
              </Grid>
              {this.state.emptyPassword ? <Grid container alignItems='flex-end' >
                <Alert severity="error" className={classes.registerAlert}>Password field is empty!</Alert></Grid> 
                : null}
              <Grid container alignItems='center' className={classes.registerFieldContainer}>
                <Grid item>
                  <Typography color='secondary' display='inline'>*&nbsp;</Typography>
                  <BlackTextTypography display='inline'>Re-enter password</BlackTextTypography>
                </Grid>
                <Grid item className={classes.registerTextfield}>
                  <TextField variant='outlined' fullWidth required size='small' type="password" name='password_repeat' 
                  value={this.state.password_repeat || ''} 
                  onChange={ (event) => this.handleRegisterFormChange(event) } />
                </Grid>
              </Grid>
              {this.state.diffPassword ? <Grid container alignItems='flex-end' >
                <Alert severity="error" className={classes.registerAlert}>Passwords do not match.</Alert></Grid> 
                : null}
              <Grid container alignItems='center' className={classes.registerFieldContainer}>
                <Grid item>
                  <Typography color='secondary' display='inline'>*&nbsp;</Typography>
                  <BlackTextTypography display='inline'>First name</BlackTextTypography>
                </Grid>
                <Grid item className={classes.registerTextfield}>
                  <TextField variant='outlined' fullWidth required size='small' name='first_name' 
                  value={this.state.first_name || ''} 
                  onChange={ (event) => this.handleRegisterFormChange(event) } />
                </Grid>
              </Grid>
              {this.state.emptyFirstName ? <Grid container alignItems='flex-end' >
                <Alert severity="error" className={classes.registerAlert}>First name field is empty!</Alert></Grid> 
                : null}
              <Grid container alignItems='center' className={classes.registerFieldContainer}>
                <Grid item>
                  <Typography color='secondary' display='inline'>*&nbsp;</Typography>
                  <BlackTextTypography display='inline'>Last name</BlackTextTypography>
                </Grid>
                <Grid item className={classes.registerTextfield}>
                  <TextField variant='outlined' fullWidth required size='small' name='last_name' 
                  value={this.state.last_name || ''} 
                  onChange={ (event) => this.handleRegisterFormChange(event) } />
                </Grid>
              </Grid>
              {this.state.emptyLastName ? <Grid container alignItems='flex-end' >
                <Alert severity="error" className={classes.registerAlert}>Last name field is empty!</Alert></Grid> 
                : null}
              <Grid container alignItems='center' className={classes.registerFieldContainer}>
                <Grid item>
                  <BlackTextTypography>Location</BlackTextTypography>
                </Grid>
                <Grid item className={classes.registerTextfield}>
                  <TextField variant='outlined' fullWidth size='small' name='location' 
                  value={this.state.location || ''} 
                  onChange={ (event) => this.handleRegisterFormChange(event) } />
                </Grid>
              </Grid>
              <Grid container alignItems='center' className={classes.registerFieldContainer}>
                <Grid item>
                  <BlackTextTypography>Description</BlackTextTypography>
                </Grid>
                <Grid item className={classes.registerTextfield}>
                  <TextField variant='outlined' fullWidth multiline rows={4} name='description' 
                  value={this.state.description || ''} 
                  onChange={ (event) => this.handleRegisterFormChange(event) } />
                </Grid>
              </Grid>
              <Grid container alignItems='center' className={classes.registerFieldContainer}>
                <Grid item>
                  <BlackTextTypography>Occupation</BlackTextTypography>
                </Grid>
                <Grid item className={classes.registerTextfield}>
                  <TextField variant='outlined' fullWidth size='small' name='occupation' 
                  value={this.state.occupation || ''} 
                  onChange={ (event) => this.handleRegisterFormChange(event) } />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <div>
            <Grid container className={classes.centerContainer}>
              <Grid className={classes.registerButtonGrid}>
                <Button color='primary' variant='contained' size='large' fullWidth
                onClick={ (event) => this.handleRegister(event) }>Register me</Button>
              </Grid>
            </Grid>
          </div>
        </Box>
        </Box>}
        <Dialog fullWidth open={this.state.openRegisterSuccessDialog}
        onClose={ (event) => this.handleCloseSuccessDialog(event) } aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Success</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Congratulations, your account has been successfully created!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={ (event) => this.handleCloseSuccessDialog(event) } color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog fullWidth open={this.state.openRegisterFailureDialog}
        onClose={ (event) => this.handleCloseFailureDialog(event) } aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Success</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Failure. Please try again!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={ (event) => this.handleCloseFailureDialog(event) } color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }
}

export default withStyles(styles)(LoginRegister);