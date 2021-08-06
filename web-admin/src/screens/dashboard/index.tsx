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
		title: 'Berkshares Outstanding',
		body: '123004B',
		additional: 'Bank I'
	},
	{
		title: 'Berkshares Outstanding',
		body: '123004B',
		additional: 'Bank II'
	},
	{
		title: 'Berkshares Burnt',
		body: '234B',
		additional: 'Bank II'
	},
	{
		title: 'Berkshares Burnt',
		body: '234B',
		additional: 'Bank I'
	},
	{
		title: 'Transactions Today',
		body: '1020'
	},
	{
		title: 'Total Transactions',
		body: '100034'
	},
	{
		title: 'Pending Deposits',
		body: '250'
	},
	{
		title: 'Total Buisnesses',
		body: '200'
	},
	{
		title: 'Total Users',
		body: '10000'
	},
	{
		title: 'Redemption Fees Paid',
		body: '123004B',
	},
	{
		title: 'Donations',
		body: '123004B',
	},
]

const Dashboard = () => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
			{CardsData.map(c => <DataCard key={c.title} title={c.title} body={c.body} additional={c.additional} />)}
		</div>
 );
}

export default Dashboard;