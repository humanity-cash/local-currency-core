import { Modal, Sidebar } from "components";
import {
	BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import { ContractsScreen, TransactionsScreen } from "screens";

const App = () => {
	return (
		<div>
			<Router>
				<Sidebar />
				<Modal />
				<Switch>
					<Route path="/contracts" exact component={ContractsScreen}/>
					<Route path="/ach/transactions" component={TransactionsScreen.ACHTransactionsTable}/>
					<Route path="/bc/transactions" component={TransactionsScreen.BlockchainTransactionsTable}/>
				</Switch>
			</Router>
		</div>
  )
}

export default App