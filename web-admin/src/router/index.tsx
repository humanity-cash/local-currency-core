import {
	BrowserRouter as Router, Route, Switch
} from "react-router-dom";

const App = () => {
	return (
		<div>
			<Router>
				<Switch>
					<Route path="/" exact component={() => <div>home page</div>}/>
					<Route path="/second" component={() => <div>second page</div>}/>
				</Switch>
			</Router>
		</div>
  )
}

export default App