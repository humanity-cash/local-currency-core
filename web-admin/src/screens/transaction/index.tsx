import { makeStyles } from '@material-ui/core/styles';
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
	const bank = 'Bank Of';
	const type = 'Funding';
	const status = 'Success';
	const amount = 45;

	return (
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
				<span className={classes.prop}>Bank:</span>
				{` ${bank}`}
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
			<div></div>
			<div className={classes.bctitle}>Blockchain Data</div>
			<div></div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Amount:</span>
				{` ${amount}$`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Amount:</span>
				{` ${amount}$`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Amount:</span>
				{` ${amount}$`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Amount:</span>
				{` ${amount}$`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Amount:</span>
				{` ${amount}$`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Amount:</span>
				{` ${amount}$`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Amount:</span>
				{` ${amount}$`}
			</div>
			<div className={classes.fs18}>
				<span className={classes.prop}>Amount:</span>
				{` ${amount}$`}
			</div>
		</div>
	);
}

export default Transaction;