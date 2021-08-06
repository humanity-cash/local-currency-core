import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    maxWidth: '250px',
    minHeight: '20vh',
  },
  title: {
    fontSize: 14,
    textAlign: 'center'
  },
  contentWrapper: {
    display: 'grid',
    gridGap: '2em'
  },
});

interface DataCardInput {
  title?: string
  body?: string
  additional?: string
}

const DataCard = (props: DataCardInput) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <div className={classes.contentWrapper}>
          <Typography className={classes.title} color="textSecondary" gutterBottom>
          {props?.title} 
          </Typography>
          <Typography variant="h5" component="h2" style={{justifySelf: 'center'}}>
          {props?.body} 
          </Typography>
          <Typography variant="h5" component="h2" style={{justifySelf: 'center'}}>
          {props.additional} 
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}


export default DataCard;