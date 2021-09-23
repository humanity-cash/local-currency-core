import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import {
	createStyles, makeStyles,
	Theme
} from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			width: '100%',
		},
		button: {
			marginRight: theme.spacing(1),
		},
		instructions: {
			marginTop: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
	})
);

function getSteps() {
	return [
		'Started ACH Transaction',
		'Confirm ACH Transaction',
		'Complete - Execute Blockchain Transaction',
	];
}

const TransactionStepper = () => {
	const classes = useStyles();
	const [activeStep, setActiveStep] = React.useState(1);
	const steps = getSteps();

	return (
		<div className={classes.root}>
			<Stepper alternativeLabel activeStep={activeStep}>
				{steps.map((label) => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
		</div>
	);
}

export default TransactionStepper;