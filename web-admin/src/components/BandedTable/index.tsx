// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import {
	Grid,
	Table,
	TableBandHeader,
	TableHeaderRow
} from '@devexpress/dx-react-grid-material-ui';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { useState } from 'react';
import { countries } from '../mockData';

const useStyles = makeStyles({
  root: {
  },
	wrapper: {
		paddingLeft: '20em'
	}
});


const BandedTable =  () => {
	const [columns] = useState([
		{ name: 'bank', title: 'Bank' },
		{ name: 'completedDeposits', title: 'Completed' },
		{ name: 'pendingDeposits', title: 'Pending' },
		{ name: 'completedWithdrawals', title: 'Completed' },
		{ name: 'pendingWithdrawals', title: 'Pending' },
		{ name: 'currentOutstandingBerkshares', title: 'Current'},
		{ name: 'pendingOutstandingBerkshares', title: 'Pending'},
	]);
  const classes = useStyles();

	const [columnBands] = useState([
		{
			title: 'Deposits',
			children: [
				{ columnName: 'completedDeposits' },
				{ columnName: 'pendingDeposits' },
			],
		},
		{
			title: 'Withdrawals',
			children: [
				{ columnName: 'completedWithdrawals' },
				{ columnName: 'pendingWithdrawals' },
			],
		},
		{
			title: 'Outstanding B$',
			children: [
				{ columnName: 'currentOutstandingBerkshares' },
				{ columnName: 'pendingOutstandingBerkshares' },
			],
		},
		// {
		// 	title: 'Outstanding B$',
		// 	children: [
		// 		{ columnName: 'GDP_Industry' },
		// 		{ columnName: 'GDP_Services' },
		// 	],
		// },
	]);

	const [tableColumnExtensions] = useState([
		{ columnName: 'pendingWithdrawals', align: 'right' },
		{ columnName: 'completedWithdrawals', align: 'right' },
		{ columnName: 'pendingDeposits', align: 'right' },
		{ columnName: 'completedDeposits', align: 'right' },
		{ columnName: 'currentOutstandingBerkshares', align: 'right' },
		{ columnName: 'pendingOutstandingBerkshares', align: 'right' },
	]);

	return (
		// <div className={classes.wrapper}>
		<Paper className={classes.root}>
			<Grid
				rows={countries}
				columns={columns}
				style={{ paddingLeft: '20em' }}>
				<Table columnExtensions={tableColumnExtensions} />
				<TableHeaderRow />
				<TableBandHeader columnBands={columnBands} />
			</Grid>
		</Paper>
		// </div>
	);
};

export default BandedTable;