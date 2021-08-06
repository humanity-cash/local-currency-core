import { Sidebar } from "components";
import { Route, Switch } from "react-router-dom";
import { ChangePasswordScreen, ContractsScreen, DashboardScreen, LoginScreen, TransactionScreen, TransactionsScreen, UsersScreen } from "screens";

export const ProtectedRoutes = () => {
	return (
		<>
			<Sidebar />
			<Switch>
					<Route path="/dashboard" exact component={() => <DashboardScreen />}/>
					<Route path="/contracts" exact component={() => <ContractsScreen />}/>
					<Route path="/users" exact component={() => <UsersScreen />}/>
					<Route path="/transaction/id" exact component={() => <TransactionScreen />}/>
					<Route path="/ach/transactions" exact component={() => <TransactionsScreen.ACHTransactionsTable />}/>
					<Route path="/bc/transactions" exact component={() => <TransactionsScreen.BlockchainTransactionsTable />}/>
			</Switch>
		</>
  );

}

export const NotProtectedRoutes = () => {
	return (
		<>
			<Sidebar />
			<Switch>
					<Route path="/login" exact component={LoginScreen}/>
					<Route path="/change-password" exact component={ChangePasswordScreen}/>
			</Switch>
		</>
  );
};