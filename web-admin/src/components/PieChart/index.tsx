import { useState, useEffect } from 'react'
import { Animation, EventTracker, Palette } from '@devexpress/dx-react-chart';
import {
	Chart, Legend,
	PieSeries, Title, Tooltip
} from '@devexpress/dx-react-chart-material-ui';
import Paper from '@material-ui/core/Paper';
import {
	schemeAccent
} from 'd3-scale-chromatic';
import useOperatorData from '../../hooks/useOperatorData';
import { OperatorData } from '../../types';

const PieChart = () => {
	const [chartData, setChartData] = useState<any[]>([])
	const operatorState = useOperatorData()

	useEffect(() => {
		setChartData(operatorState.data.map((data: OperatorData) => {
			return {country: data.operatorDisplayName, area: data.currentOutstanding}
		}))
	}, [operatorState])

	return (
		<Paper>
			<Chart data={chartData}>
				<Palette scheme={schemeAccent} />
				<PieSeries
					valueField='area'
					argumentField='country'
					name='name'
				/>
				<Title text='BerkShares Outstanding' />
				<EventTracker />
				<Tooltip />
				<Legend />
				<Animation />
			</Chart>
		</Paper>
	);
};

export default PieChart;
