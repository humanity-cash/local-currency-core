import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AccountBalanceTwoToneIcon from '@material-ui/icons/AccountBalanceTwoTone';
import DashboardTwoToneIcon from '@material-ui/icons/DashboardTwoTone';
import PeopleTwoToneIcon from '@material-ui/icons/PeopleTwoTone';
import ReceiptTwoToneIcon from '@material-ui/icons/ReceiptTwoTone';
import ViewListTwoToneIcon from '@material-ui/icons/ViewListTwoTone';
import clsx from 'clsx';
import { AuthContext, AuthStatus } from 'context/auth';
import React, { useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
	toolbar: {
		backgroundColor: '#4d5d53',
	},
	root: {
		display: 'flex',
	},
	appBar: {
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
	},
	appBarShift: {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: drawerWidth,
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	hide: {
		display: 'none',
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
	},
	drawerHeader: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(0, 1),
		// necessary for content to be below app bar
		...theme.mixins.toolbar,
		justifyContent: 'flex-end',
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		marginLeft: -drawerWidth,
	},
	contentShift: {
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
		marginLeft: 0,
	},
}));

const SIDE_BAR_OPTIONS = [
	{ text: 'Dashboard', path: '/dashboard', Icon: DashboardTwoToneIcon },
	{
		text: 'ACH Transactions',
		path: '/ach/transactions',
		Icon: AccountBalanceTwoToneIcon,
	},
	{
		text: 'Blockchain Transactions',
		path: '/bc/transactions',
		Icon: ViewListTwoToneIcon,
	},
	{ text: 'Users', path: '/users', Icon: PeopleTwoToneIcon },
	{
		text: 'Smart Contracts Configuration',
		path: '/contracts',
		Icon: ReceiptTwoToneIcon,
	},
];

const Sidebar = () => {
	const classes = useStyles();
	const theme = useTheme();
	const [open, setOpen] = React.useState(true);
	const { pathname } = useLocation();
	const auth = useContext(AuthContext);
	const { authStatus } = auth;
	useEffect(() => {
		if (authStatus === AuthStatus.SignedIn) {
			return setOpen(true);
		}

		return setOpen(false);
	}, [authStatus]);
	const history = useHistory();

	return (
		<div className={classes.root}>
			<CssBaseline />
			<AppBar
				position='fixed'
				className={clsx(classes.appBar, {
					[classes.appBarShift]: open,
				})}>
				<Toolbar classes={{ root: classes.toolbar }}>
					<IconButton
						color='inherit'
						aria-label='open drawer'
						onClick={() => {}}
						edge='start'
						className={clsx(
							classes.menuButton,
							open && classes.hide
						)}>
						{/* <MenuIcon /> */}
					</IconButton>
					<Typography variant='h6' noWrap>
						Humanity Cash
					</Typography>
				</Toolbar>
			</AppBar>
			<Drawer
				className={classes.drawer}
				variant='persistent'
				anchor='left'
				open={open}
				classes={{
					paper: classes.drawerPaper,
				}}>
				<div className={classes.drawerHeader}></div>
				{/* <Divider /> */}
				<List>
					{SIDE_BAR_OPTIONS.map(({ text, path, Icon }, index) => (
						<ListItem
							onClick={() => history.push(path)}
							selected={path === pathname}
							button
							key={path}>
							<ListItemIcon>{<Icon />}</ListItemIcon>
							<ListItemText primary={text} />
						</ListItem>
					))}
					<Divider />
					<Divider />
					<Divider />
					<Divider />
					<ListItem
						onClick={() => auth.signOut()}
						selected={false}
						button
						key={'closeDrawer'}>
						<ListItemIcon>{}</ListItemIcon>
						<ListItemText primary={'SignOut'} />
					</ListItem>
				</List>
			</Drawer>
			<div className={classes.drawerHeader} />
		</div>
	);
};

export default Sidebar;
