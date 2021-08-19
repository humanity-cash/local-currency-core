//@ts-nocheck
import { Animation } from '@devexpress/dx-react-chart';
import {
	ArgumentAxis, Chart, Legend, LineSeries,
	Title, ValueAxis
} from '@devexpress/dx-react-chart-material-ui';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { confidence as data } from '../mockData';


const format = () => (tick) => tick;
const legendStyles = () => ({
	root: {
		display: 'flex',
		margin: 'auto',
		flexDirection: 'row',
	},
});
const legendLabelStyles = (theme) => ({
	label: {
		paddingTop: theme.spacing(1),
		whiteSpace: 'nowrap',
	},
});
const legendItemStyles = () => ({
	item: {
		flexDirection: 'column',
	},
});

const legendRootBase = ({ classes, ...restProps }) => (
	<Legend.Root {...restProps} className={classes.root} />
);
const legendLabelBase = ({ classes, ...restProps }) => (
	<Legend.Label className={classes.label} {...restProps} />
);
const legendItemBase = ({ classes, ...restProps }) => (
	<Legend.Item className={classes.item} {...restProps} />
);
const Root = withStyles(legendStyles, { name: 'LegendRoot' })(legendRootBase);
const Label = withStyles(legendLabelStyles, { name: 'LegendLabel' })(
	legendLabelBase
);
const Item = withStyles(legendItemStyles, { name: 'LegendItem' })(
	legendItemBase
);
const demoStyles = () => ({
	chart: {
		paddingRight: '20px',
	},
	title: {
		whiteSpace: 'pre',
	},
});

const ValueLabel = (props) => {
	const { text } = props;
	return <ValueAxis.Label {...props} text={`${text}`} />;
};

const titleStyles = {
	title: {
		whiteSpace: 'pre',
	},
};
const TitleText = withStyles(titleStyles)(({ classes, ...props }) => (
	<Title.Text {...props} className={classes.title} />
));

const LineChart = (props) => {
	const { classes, title, yAxis } = props;

	return (
		<Paper>
			<Chart data={data} className={classes.chart}>
				<ArgumentAxis tickFormat={format} />
				<ValueAxis max={100} labelComponent={ValueLabel} />

				<LineSeries
					name='X - Days'
					valueField='tvNews'
					argumentField='year'
				/>
				<LineSeries
					name={yAxis}
					valueField='tvNews'
					argumentField='year'
				/>
				<Legend
					position='bottom'
					rootComponent={Root}
					itemComponent={Item}
					labelComponent={Label}
				/>
				<Title
					text={title}
					textComponent={TitleText}
				/>
				<Animation />
			</Chart>
		</Paper>
	);
};

export default withStyles(demoStyles, { name: 'Demo' })(LineChart);
