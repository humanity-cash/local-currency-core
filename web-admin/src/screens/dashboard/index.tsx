import { makeStyles } from '@material-ui/core/styles';
import DataCard from 'components/card';

const useStyles = makeStyles({
  wrapper: {
    padding: '24px',
    paddingLeft: '18em',
		gridGap: '0.8em',
		display: 'grid',
		gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
		gridTemplateRows: '1fr 1fr 1fr',
  },
});

const CardsData = [
	{
		title: 'Berkshares Minted',
		body: '1234'
	},
	{
		title: 'Berkshares Burned',
		body: '1234'
	},
	{
		title: 'Total Users',
		body: '1234'
	},
	{
		title: 'Total Buisnesses',
		body: '1234'
	},
	{
		title: 'Total Transactions',
		body: '1234'
	},
	{
		title: 'Pending Deposits',
		body: '1234'
	},
]

const Dashboard = () => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
			{CardsData.map(c => <DataCard title={c.title} body={c.body} />)}
		</div>
 );
}

export default Dashboard;