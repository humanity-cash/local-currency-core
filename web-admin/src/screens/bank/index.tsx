import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { ACHTransactionsTable } from 'screens/transactions';

const useStyles = makeStyles({
	wrapper: {
		paddingTop: '1em',
		// padding: '34px',
		paddingLeft: '20em',
		// paddingLeft: '18em',
		display: 'grid',
		gridTemplateColumns: '0.5fr 1fr',
		gridRowGap: '1.2em',
	},
	achTitle: {
		paddingLeft: '1em',
		// paddingBottom: '0',
		paddingTop: '0.5em',
		// justifyContent: 'center',
		// alignContent: 'center',
		display: 'grid',
		fontSize: '24px',
		// gridTemplateColumns: '0.5fr 1fr',
		// gridRowGap: '1.2em',
	},
	fs18: {
		fontSize: '18px',
	},
	bctitle: {
		fontSize: '34px',
		alignItems: 'left',
		textDecoration: 'underline',
	},
	title: {
		fontSize: '34px',
		alignItems: 'left',
		textDecoration: 'underline',
	},
	prop: {
		color: 'gray',
	},
});

const Bank = () => {
	const classes = useStyles();
	const bank = 'Bank Of';
	const awaitingTransactions = '4';
	const totalFunding = '250000B$';
	const TotalRedemption = '-250000B$';

	return (
		<div>
			<div className={classes.wrapper}>
				<div className={classes.title}>{`Bank: ${bank}`}</div>
				<div></div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Total Funding:</span>
					{`${totalFunding}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Total Redemption:</span>
					{` ${TotalRedemption}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Awaiting Transactions:</span>
					{` ${awaitingTransactions}`}
				</div>
			</div>
			<div>
				<ACHTransactionsTable />
			</div>
		</div>
	);
};

export default Bank;
