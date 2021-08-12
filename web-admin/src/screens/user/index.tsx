import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { useState } from 'react';
import { ACHTransactionsTable } from 'screens/transactions';
import BlockchainDataTable from 'screens/transactions/blockchain';
import { UserTables } from 'types';
import Buttons from './new';

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
		fontSize: '24px'
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

const User = () => {
	const [tableType, setTableType] = useState<UserTables>(UserTables.UserACHTRansactions);
	const classes = useStyles();
	const user = 'John Doe';
	const bank = 'Bank Of';
	const dowllaId = '01010101010101';
	const outstandingBerkshares = '250B$';
	const address = 'Tufnell Park 32';

	return (
		<div>
			<div className={classes.wrapper}>
				<div className={classes.title}>{`User: ${user}`}</div>
				<div></div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Created At:</span>
					{` ${moment().format()}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Dowlla Id:</span>
					{`${dowllaId}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Bank:</span>
					{` ${bank}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Outstanding:</span>
					{` ${outstandingBerkshares}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Address:</span>
					{` ${address}`}
				</div>
			</div>
			<div className={classes.achTitle}>
				<Buttons setTableType={setTableType} currentTable={tableType} />
			</div>
			<div>
				{tableType === 1 ? (
					<BlockchainDataTable />
				) : (
					<ACHTransactionsTable />
				)}
			</div>
		</div>
	);
};

export default User;
