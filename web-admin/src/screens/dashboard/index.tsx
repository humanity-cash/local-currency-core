import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { BandedTable, BarChart, LineChart, PieChart } from 'components';
import useOperatorData from '../../hooks/useOperatorData';
import { ITransaction } from '../../types';

const useStyles = makeStyles({
  wrapper: {
    padding: '24px',
    paddingLeft: '18em',
		gridRowGap: '0.8em',
		display: 'grid',
		gridTemplateColumns: '1fr',
		gridTemplateRows: '1fr 1fr 1fr 1fr 1fr ',
  },
});

const Dashboard = () => {
	const [depositData, setDepositData] = useState<any[]>([])
	const [withdrawData, setWithdrawData] = useState<any[]>([])
	const classes = useStyles();
	const operators = useOperatorData()
	  
	useEffect(() => {
		let deposits: any[] = []
		let withdrawals: any[] = []

		operators.data.forEach((operator) => {
			deposits = deposits.concat(operator.deposits.map((deposit: ITransaction) => {
				return {bank: operator.operatorDisplayName, ...deposit}
			}))
			withdrawals = withdrawals.concat(operator.withdrawals.map((withdraw: ITransaction) => {
				return {bank: operator.operatorDisplayName, ...withdraw}
			}))
		})

		setDepositData(deposits)
		setWithdrawData(withdrawals)
 	}, [operators])

  	return (
		<div className={classes.wrapper}>
			<BandedTable />
			<PieChart />
			<BarChart title={'Deposits Per Bank'} data={depositData}/>
			<BarChart title={'Withdrawals Per Bank'} data={withdrawData} />
			<LineChart title={'Redepmtion Fees'} yAxis='Y - Fees' />
			<LineChart title={'Community Chest'} yAxis='Y - Contributions' />
			{/* {CardsData.map(c => <DataCard key={c.title} title={c.title} body={c.body} additional={c?.additional} />)} */}
		</div>
  );
}

export default Dashboard;