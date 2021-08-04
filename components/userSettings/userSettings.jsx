import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@material-ui/core';
import axios from 'axios';

const styles = {

}

class UserSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openDeleteAccountDialog: false

    }
  }

  handleOpenDeleteAccountDialog() {
    this.setState({ openDeleteAccountDialog: true });
  }

  handleCloseDeleteAccountDialog() {
    this.setState({ openDeleteAccountDialog: false });
  }

  handleSubmitDeleteAccount() {
    axios.delete('/user').then(() => {
      this.setState({ openDeleteAccountDialog: false });
      this.props.setLoginStatus(false, undefined, undefined);
    }).catch((error) => {
      console.log(error);
    })
  }

  render() {
    const { classes } = this.props;
    return (
      <Box>
        <Button variant='contained' color='secondary' 
        onClick={ this.handleOpenDeleteAccountDialog.bind(this) }>Delete Account</Button>
        <Dialog fullWidth open={this.state.openDeleteAccountDialog}
        onClose={ (event) => this.handleCloseDeleteAccountDialog(event) } aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Are you sure you want to delete your account?</DialogTitle>
          <DialogContent>
            <Typography>This action will permanently erase your account, including all of your photos, comments, 
              and other associated data, and cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={ (event) => this.handleCloseDeleteAccountDialog(event) } color="primary">
              Cancel
            </Button>
            <Button color='secondary' 
            onClick={(event) => this.handleSubmitDeleteAccount(event)} className={classes.dialogDeleteButton}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }
}

export default withStyles(styles)(UserSettings);