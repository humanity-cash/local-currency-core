import { makeStyles } from '@material-ui/core/styles';
import { TransactionStepper } from 'components';
import moment from 'moment';

const useStyles = makeStyles({
	wrapper: {
		padding: '34px',
		paddingLeft: '24em',
		display: 'grid',
		gridTemplateColumns: '0.5fr 1fr',
		gridRowGap: '1.2em'
	},
	fs18: {
		fontSize: '18px',
	},
	bctitle: {
		fontSize: '34px',
		alignItems: 'left',
		textDecoration: 'underline'
	},
	title: {
		fontSize: '34px',
		alignItems: 'left',
		textDecoration: 'underline'
	},
	prop: {
		color: 'gray'
	},
});

const Transaction = () => {
	const classes = useStyles();
	const user = 'John Doe';
	const userBank = 'Bank Of';
	const berksharesBank = 'Bank Of';
	const type = 'Funding';
	const hash = '0x0000000000000000';
	const status = 'Success';
	const blocksConfirmed = 3;
	const from = 'Berkshare';
	const to = 'John Doe';
	const amount = 45;
	const blockchainType = 'Deposit';

	return (
		<div>
			<div>
				<TransactionStepper />
			</div>
			<div className={classes.wrapper}>
				<div className={classes.title}>Transaction 878</div>
				<div></div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Created At:</span>
					{` ${moment().format()}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Confirmed At:</span>
					{` ${moment().format()}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>User:</span>
					{` ${user}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>User Bank:</span>
					{` ${userBank}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>BerkShares Bank:</span>
					{` ${berksharesBank}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Type:</span>
					{` ${type}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Status:</span>
					{` ${status}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Amount:</span>
					{` ${amount}$`}
				</div>
				<div className={classes.bctitle}>Blockchain Data</div>
				<div></div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Hash:</span>
					{` ${hash}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>type:</span>
					{` ${blockchainType}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>From:</span>
					{` ${from}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>To:</span>
					{` ${to}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Amount:</span>
					{` B$ ${amount}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Blocks Confirmed:</span>
					{` ${blocksConfirmed}`}
				</div>
			</div>
		</div>
	);
}

export default Transaction;