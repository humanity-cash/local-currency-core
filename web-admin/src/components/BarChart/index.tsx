// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { useState, useEffect } from 'react';
import { Animation, Stack } from '@devexpress/dx-react-chart';
import {
	ArgumentAxis, BarSeries, Chart, Legend, Title, ValueAxis
} from '@devexpress/dx-react-chart-material-ui';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';


const legendStyles = () => ({
	root: {
		display: 'flex',
		margin: 'auto',
		flexDirection: 'row',
	},
});
const legendRootBase = ({ classes, ...restProps }) => (
	<Legend.Root {...restProps} className={classes.root} />
);
const Root = withStyles(legendStyles, { name: 'LegendRoot' })(legendRootBase);
const legendLabelStyles = () => ({
	label: {
		whiteSpace: 'nowrap',
	},
});
const legendLabelBase = ({ classes, ...restProps }) => (
	<Legend.Label className={classes.label} {...restProps} />
);
const Label = withStyles(legendLabelStyles, { name: 'LegendLabel' })(
	legendLabelBase
);

const BarChart = ({title, data}: any) => {
	const [chartData, setChartData] = useState<any[]>([])
	const [banks, setBanks] = useState<string[]>([])

	useEffect(() => {
		const chartDatas: any[] = []
		const banks: string[] = []
		const sortedData: any[] = data.sort((a, b) => {
			return a.timestamp > b.timestamp ? 1 : -1;
		})

		sortedData.forEach((value) => {
			const month = moment(value.timestamp).format("MMMM")
			const bank = value.bank
			if(chartDatas.length < 1 || month !== chartDatas[chartDatas.length-1].month) {
				chartDatas.push({month: month})
			}

			if(!banks.includes(bank)) {
				banks.push(bank)
			}
			if(chartDatas[chartDatas.length-1][bank]) {
				chartDatas[chartDatas.length-1][bank] += +value.value
			} else {
				chartDatas[chartDatas.length-1][bank] = +value.value
			}
		})

		setBanks(banks)
		setChartData(chartDatas)
	}, [data])

	return (
		<Paper>
			<Chart data={chartData}>
				<ArgumentAxis />
				<ValueAxis />

				{banks.map((bank: any) => {
					return (
						<BarSeries
							name={bank}
							valueField={bank}
							argumentField='month'
						/>
					)
				})}
				<Animation />
				<Legend
					position='bottom'
					rootComponent={Root}
					labelComponent={Label}
				/>
				<Title text={title} />
				<Stack />
			</Chart>
		</Paper>
	);
};

export default BarChart;
