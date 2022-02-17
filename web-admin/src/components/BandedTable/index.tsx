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
import useOperatorData from '../../hooks/useOperatorData';

const useStyles = makeStyles({
  root: {
  },
	wrapper: {
		paddingLeft: '20em'
	}
});

const thousandSeperator = (val: number) => {
	return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const BandedTable =  () => {
	const [columns] = useState([
		{ name: 'operatorDisplayName', title: 'Bank' },
		{ name: 'totalDeposits', title: 'Completed', getCellValue: (row: any, columnName: string) => {return `${thousandSeperator(row.totalDeposits)}$`} },
		{ name: 'pendingDeposits', title: 'Pending' },
		{ name: 'totalWithdrawals', title: 'Completed', getCellValue: (row: any, columnName: string) => {return `${thousandSeperator(row.totalWithdrawals)}$`} },
		{ name: 'pendingWithdrawals', title: 'Pending' },
		{ name: 'currentOutstanding', title: 'Current', getCellValue: (row: any, columnName: string) => {return `${thousandSeperator(row.currentOutstanding)}$`}},
		{ name: 'pendingOutstandingBerkshares', title: 'Pending'},
	]);
	const classes = useStyles();
	const operatorState = useOperatorData()

	const [columnBands] = useState([
		{
			title: 'Deposits',
			children: [
				{ columnName: 'totalDeposits' },
				{ columnName: 'pendingDeposits' },
			],
		},
		{
			title: 'Withdrawals',
			children: [
				{ columnName: 'totalWithdrawals' },
				{ columnName: 'pendingWithdrawals' },
			],
		},
		{
			title: 'Outstanding B$',
			children: [
				{ columnName: 'currentOutstanding' },
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
		{ columnName: 'totalWithdrawals', align: 'right' },
		{ columnName: 'pendingDeposits', align: 'right' },
		{ columnName: 'totalDeposits', align: 'right' },
		{ columnName: 'currentOutstanding', align: 'right' },
		{ columnName: 'pendingOutstandingBerkshares', align: 'right' },
	]);

	return (
		// <div className={classes.wrapper}>
		<Paper className={classes.root}>
			<Grid
				rows={operatorState.data}
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