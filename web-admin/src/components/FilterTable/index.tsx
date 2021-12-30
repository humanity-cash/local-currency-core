import { DataTypeProvider, FilteringState, IntegratedFiltering, IntegratedPaging, PagingState } from '@devexpress/dx-react-grid';
import {
	Grid,
	PagingPanel,
	Table,
	TableFilterRow,
	TableHeaderRow
} from '@devexpress/dx-react-grid-material-ui';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { useHistory } from 'react-router-dom';
import { IACHTransaction } from '../../types';


const useStyles = makeStyles({
	tableStriped: {
		'& tbody tr:nth-of-type(odd)': {
			backgroundColor: fade('#aacfef', 0.15),
		},
	},
});

const TableComponentBase = (props: any) => {
	const classes = useStyles()
	return <Table.Table className={classes.tableStriped} {...props} />;
};

const UserBankFormatter = ({ value }: any) => {
	const history = useHistory();
	return (
		<div
			style={{ cursor: 'pointer', textDecoration: 'underline' }}
			onClick={() => history.push(`/bank/${value}`)}>
			{value}
		</div>
	);
}

const UsernameFormatter = ({ value }: any) => {
	const history = useHistory();
	return (
		<div
			style={{ cursor: 'pointer', textDecoration: 'underline' }}
			onClick={() => history.push(`/user/${value}`)}>
			{value}
		</div>
	);
}

const UserBankTypeProvider = (props: any) => (
	<DataTypeProvider formatterComponent={UserBankFormatter} {...props} />
);

const UsernameTypeProvider = (props: any) => (
	<DataTypeProvider formatterComponent={UsernameFormatter} {...props} />
);

const TransactionIdFormatter = ({ value }: any) => {
	const history = useHistory();
	return (
		<div
			style={{ cursor: 'pointer', textDecoration: 'underline' }}
			onClick={() => history.push(`/transaction/${value}`)}>
			{value}
		</div>
	);
}

const TransactionIdTypeProvider = (props: any) => (
	<DataTypeProvider formatterComponent={TransactionIdFormatter} {...props} />
);

const FilterTable = ({columns, rows}: any) => {
	const transactionIdColumn = ['transactionId'];
	const usernameColumn = ['username'];
	const userBankColumn = ['userBank'];
	const berksharesBankColumn = ['berksharesBank'];

	return (
		<Paper>
			<Grid rows={rows} columns={columns}>
				<TransactionIdTypeProvider for={transactionIdColumn} />
				<UsernameTypeProvider for={usernameColumn} />
				<UserBankTypeProvider for={userBankColumn} />
				<UserBankTypeProvider for={berksharesBankColumn} />
				<FilteringState defaultFilters={[]} />
				<IntegratedFiltering />
				<PagingState defaultCurrentPage={0} pageSize={10} />
				<IntegratedPaging />
				<Table tableComponent={TableComponentBase} />
				<TableHeaderRow />
				<TableFilterRow />
				<PagingPanel />
			</Grid>
		</Paper>
	);
};

export default FilterTable