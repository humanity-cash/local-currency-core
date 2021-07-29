import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(6),
    paddingTop: theme.spacing(24),
  }
}));

interface ChangePasswordProps {
  email: string
  newPassword: string
  oldPassword: string
  setNewPassword: Function
  handler: any 
};

const ChangePasswordScreen = (props: ChangePasswordProps) => {
  const { email, newPassword, oldPassword, setNewPassword, handler } = props;
  const classes = useStyles();
  // const history = useHistory();

  return (
    <Container className={classes.container} maxWidth="xs">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Email" 
                  name="email" 
                  value={email}
                  disabled={true}
                  size="small" 
                  variant="outlined" />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Old Password" 
                  name="oldPassword" 
                  value={oldPassword}
                  disabled={true}
                  size="small" 
									type="password"
                  variant="outlined" />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  label="New Password"
                  name="newPassword"
                  size="small"
                  type="password"
                  variant="outlined" />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Button color="secondary" onClick={handler} fullWidth type="submit" variant="contained">
							Change Password
            </Button>
          </Grid>
        </Grid>
    </Container>
  );
};

export default ChangePasswordScreen;