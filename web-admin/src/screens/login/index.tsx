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

const LoginPage = () => {
  const classes = useStyles();

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
                  size="small" 
                  variant="outlined" />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  size="small"
                  type="password"
                  variant="outlined" />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Button color="secondary" onClick={() => {}} fullWidth type="submit" variant="contained">
              Log in
            </Button>
          </Grid>
        </Grid>
    </Container>
  );
};

export default LoginPage;