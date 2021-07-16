import { Modal, Sidebar } from "components";
import {
	BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import { ContractsScreen } from "screens";

const App = () => {
	return (
		<div>
			<Router>
				<Sidebar />
				<Modal />
				<Switch>
					<Route path="/contracts" exact component={ContractsScreen}/>
					<Route path="/second" component={() => <div>second page</div>}/>
				</Switch>
			</Router>
		</div>
  )
}

export default App