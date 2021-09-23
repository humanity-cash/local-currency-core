//@ts-nocheck
import { Animation, Stack } from '@devexpress/dx-react-chart';
import {
	ArgumentAxis, BarSeries, Chart, Legend, Title, ValueAxis
} from '@devexpress/dx-react-chart-material-ui';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { olimpicMedals as data } from '../mockData';


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

const BarChart = ({title}: any) => {
	return (
		<Paper>
			<Chart data={data}>
				<ArgumentAxis />
				<ValueAxis />

				<BarSeries
					name='Lee Bank'
					valueField='gold'
					argumentField='country'
					color='#7fc97f'
				/>
				<BarSeries
					name='Sainsbury Bank'
					valueField='silver'
					argumentField='country'
					color='#beaed4'
				/>
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
