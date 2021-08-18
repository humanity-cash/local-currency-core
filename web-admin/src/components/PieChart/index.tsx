import { Animation, EventTracker, Palette } from '@devexpress/dx-react-chart';
import {
	Chart, Legend,
	PieSeries, Title, Tooltip
} from '@devexpress/dx-react-chart-material-ui';
import Paper from '@material-ui/core/Paper';
import {
	schemeAccent
} from 'd3-scale-chromatic';

const chartData = [
	{ country: 'Lee Bank', area: 1, fill: 'red'  },
	{ country: 'Sainsbury Bank', area: 1 },
];

const PieChart = () => {
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
