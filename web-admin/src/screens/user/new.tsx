import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { UserTables } from 'types';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			paddingLeft: '10em',
			// display: 'flex',
			// // flexDirection: 'column',
			// // alignItems: 'end',
			'& > *': {
				margin: theme.spacing(1),
			},
		},
	})
);

const outlined = 'outlined';
const contained = 'contained';
type ButtonStyles = typeof outlined | typeof contained;

const UserTableButtons = ({
	setTableType,
	currentTable,
}: {
	setTableType: any;
	currentTable: UserTables;
}) => {
  console.log("🚀 ~ file: new.tsx ~ line 32 ~ currentTable", currentTable)
  console.log("🚀 ~ file: new.tsx ~ line 32 ~ setTableType", setTableType)
	const classes = useStyles();
	const [style, setStyle] = useState<{ ach: ButtonStyles; bc: ButtonStyles }>(
		{ ach: outlined, bc: contained }
	);

	useEffect(() => {
		if (currentTable === 1) {
			setStyle({ ach: outlined, bc: contained });
		} else {
			setStyle({ ach: contained, bc: outlined });
		}
	}, [currentTable]);

	return (
		<div className={classes.root}>
			<ButtonGroup
				color='primary'
				aria-label='outlined primary button group'>
				<Button
					variant={style.ach}
					onClick={() => {
						console.log('here')
						setTableType(UserTables.UserACHTRansactions);
					}}>
					ACH Transactions
				</Button>
				<Button
					variant={style.bc}
					onClick={() =>
						setTableType(UserTables.UserBlockchainTransactions)
					}>
					Blockchain Transactions
				</Button>
			</ButtonGroup>
		</div>
	);
};

export default UserTableButtons;