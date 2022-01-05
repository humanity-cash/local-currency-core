import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { ACHTransactionsTable } from 'screens/transactions';
import BlockchainDataTable from 'screens/transactions/blockchain';
import { UserTables } from 'types';
import { useLocation } from 'react-router-dom';

const useButtonsStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			paddingLeft: '10em',
			'& > *': {
				margin: theme.spacing(1),
			},
		},
	})
);

const outlined = 'outlined';
const contained = 'contained';
type ButtonStyles = typeof outlined | typeof contained;

const UserTableButtons = ({
	setTableType,
	currentTable,
}: {
	setTableType: any;
	currentTable: UserTables;
}) => {
	const classes = useButtonsStyles();
	const [style, setStyle] = useState<{ ach: ButtonStyles; bc: ButtonStyles }>(
		{ ach: outlined, bc: contained }
	);

	useEffect(() => {
		if (currentTable === 1) {
			setStyle({ ach: outlined, bc: contained });
		} else {
			setStyle({ ach: contained, bc: outlined });
		}
	}, [currentTable]);

	return (
		<div className={classes.root}>
			<ButtonGroup
				color='primary'
				aria-label='outlined primary button group'>
				<Button
					variant={style.ach}
					onClick={() => {
						console.log('here')
						setTableType(UserTables.UserACHTRansactions);
					}}>
					ACH Transactions
				</Button>
				<Button
					variant={style.bc}
					onClick={() =>
						setTableType(UserTables.UserBlockchainTransactions)
					}>
					Blockchain Transactions
				</Button>
			</ButtonGroup>
		</div>
	);
};

const useStyles = makeStyles({
	wrapper: {
		paddingTop: '1em',
		paddingLeft: '20em',
		display: 'grid',
		gridTemplateColumns: '0.5fr 1fr',
		gridRowGap: '1.2em',
	},
	achTitle: {
		paddingLeft: '1em',
		paddingTop: '0.5em',
		display: 'grid',
		fontSize: '24px'
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
	const bank = 'Bank Of';

	const location = useLocation<any>();
	const { user } = location.state || {user: undefined}
	
	return (
		user &&
		<div>
			<div className={classes.wrapper}>
				<div className={classes.title}>{`User: ${user.name}`}</div>
				<div></div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Created At:</span>
					{` ${moment().format()}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Dowlla Id:</span>
					{` ${user.dowllaId}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Bank:</span>
					{` ${bank}`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Outstanding:</span>
					{` ${user.outstandingBalance} B$`}
				</div>
				<div className={classes.fs18}>
					<span className={classes.prop}>Address:</span>
					{` ${user.address}`}
				</div>
			</div>
			<div className={classes.achTitle}>
				<UserTableButtons
					setTableType={setTableType}
					currentTable={tableType}
				/>
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
