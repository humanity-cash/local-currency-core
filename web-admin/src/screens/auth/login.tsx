import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { Inputs } from 'components';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(6),
    paddingTop: theme.spacing(24),
  }
}));

interface LoginScreenProps{
  setLoginDetails: Function
  email: string
  password: string
  loginHandler: any 
}

const LoginScreen = (props: LoginScreenProps) => {
  const classes = useStyles();
  const { setLoginDetails, email, password, loginHandler } = props;

  return (
      <Container className={classes.container} maxWidth="xs">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Inputs.Email 
                value={email}
                onChange={(e: any)=> setLoginDetails((pv: any) => ({...pv, email: e.target.value}))}
                 />
            </Grid>
            <Grid item xs={12}>
              <Inputs.Password
                value={password}
                onChange={(e: any) => setLoginDetails((pv: any) => ({...pv, password: e.target.value}))}
                />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Button color="inherit" disabled={!password || !email} onClick={loginHandler} fullWidth type="submit" variant="contained">
            Log in
          </Button>
        </Grid>
      </Grid>
  </Container>
  );
};

export default LoginScreen;