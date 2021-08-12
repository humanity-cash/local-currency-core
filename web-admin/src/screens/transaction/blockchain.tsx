import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';

const useStyles = makeStyles({
	wrapper: {
		padding: '34px',
		paddingLeft: '24em',
		display: 'grid',
		gridTemplateColumns: '0.5fr 1fr',
		gridRowGap: '1.2em',
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

const BlockchainTransaction = () => {
	const classes = useStyles();
	const hash = '0x0000000000000000';
	const status = 'Success';
	const from = 'John Doe';
	const to = 'Good Shop';
	const amount = 45;
	const blockchainType = 'Purchase';

	return (
		<div className={classes.wrapper}>
			<div className={classes.title}>{`TX: ${hash}`}</div>
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
				<span className={classes.prop}>From:</span>
				{` ${from}`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>To:</span>
				{` ${to}`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Type:</span>
				{` ${blockchainType}`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Status:</span>
				{` ${status}`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Amount:</span>
				{` ${amount} B$`}
			</div>
			<div></div>
		</div>
	);
};

export default BlockchainTransaction;
