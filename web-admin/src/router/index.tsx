import { Modal } from "components";
import {
	BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import { ContractsScreen, DashboardScreen, LoginScreen, TransactionsScreen } from "screens";

const App = () => {
	return (
		<div>
			<Router>
				{/* <Sidebar /> */}
				<Modal />
				<Switch>
					<Route path="/contracts" exact component={ContractsScreen}/>
					<Route path="/login" exact component={LoginScreen}/>
					<Route path="/" exact component={DashboardScreen}/>
					<Route path="/ach/transactions" component={TransactionsScreen.ACHTransactionsTable}/>
					<Route path="/bc/transactions" component={TransactionsScreen.BlockchainTransactionsTable}/>
				</Switch>
			</Router>
		</div>
  )
}

export default App