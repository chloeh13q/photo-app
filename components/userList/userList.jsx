import React from 'react';
import {
  Divider,
  List,
  ListItem,
  Link as MaterialLink,
  Box,
  Chip,
}
from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import { green, red, grey } from "@material-ui/core/colors";
import './userList.css';

const styles = {
  sectionContainer: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'auto',
  },
  bubbles: {
    visibility: 'hidden'
  },
  photosCountBubble: {
    // backgroundColor: green[300],
    backgroundColor: grey[200],
    color: green[300],
    margin: '0 2px 0 10px',
  },
  commentsCountBubble: {
    // backgroundColor: red[300],
    backgroundColor: grey[200],
    color: red[300],
    '&:focus': {
      backgroundColor: grey[200]
    }
  },
  userListItem: {
    justifyContent: 'space-between'
  }
};

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userListModel: [],
      // commentOfUserModel: []
    }
    
  }

  render() {
    const { classes } = this.props;
    return (
      <Box className={classes.sectionContainer}>
        <List component='nav'>
          {this.props.commentOfUserModel.map(x => (
              <React.Fragment key={x._id}>
                <ListItem className={classes.userListItem}>
                  <MaterialLink variant='body1' component={RouterLink} to={'/users/' + x._id}>
                    {x.first_name + ' ' + x.last_name}
                  </MaterialLink>
                  {this.props.advancedFeatures ? <Box>
                    <Chip label={x.num_photos || 0} size='small' className={classes.photosCountBubble} />
                    <Chip label={x.num_comments || 0} clickable component={RouterLink} to={'/comments/' + x._id} size='small' className={classes.commentsCountBubble} />
                  </Box> : null}
                  {/* <ButtonGroup size='small' variant='text' className={this.props.advancedFeatures ? '' : classes.bubbles}>
                    <Button disabled size='small' className={{ disabled: classes.photosCountBubble }}>{x.num_photos || 0}</Button>
                    <Button component={RouterLink} to={'/comments/' + x._id} size='small' className={classes.commentsCountBubble}>{x.num_comments || 0}</Button>
                  </ButtonGroup> */}
                </ListItem>
                <Divider />
              </React.Fragment>
            )
          )}
        </List>
      </Box>
    );
  }
}

export default withStyles(styles)(UserList);
