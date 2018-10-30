import React, { Component } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

const API_ENDPOINT = window.location.hostname === 'localhost' ? 'localhost:3000' : 'api.ussfhackathon.xyz';

class App extends Component {
	render() {
		return (
			<Router>
				<div>
					<div className="App">
						<Switch>
							<Route exact path="/" component={Search} />
							<Route exact path="/background" component={Background} />
							<Route exact path="/:id" component={Player} />
							<Route exact path="/:id/compare/:id2" component={Compare} />
							<Route component={() => 'Not Found'}/>
						</Switch>
					</div>

					<Footer />
				</div>
			</Router>
		);
	}
}

const Footer = () => {
	return (
		<ul id="footer">
			<li><Link to="/">Search</Link></li>
			<li><Link to="/background">Background</Link></li>
		</ul>
	);
};

const Background = () => {
	return (
		<div>
			<h1>Background</h1>
			<p>In building their rosters, <b>Major League Soccer clubs must operate within a complex regulatory structure.</b> Clubs are restricted in the amount they may spend on player wages, the mechanisms through which they may acquire these players, and the number of international players they may include on the roster. <b>This regulatory structure has created a unique economy in which non-player assets are often traded between teams as they respectively position themselves to acquire and retain players.</b><span class="Apple-converted-space"> </span></p>

			<p><b>The use of and trading of <i>International Roster Spots</i> provides an interesting example of this unique market. </b>Players on U.S. MLS clubs are considered domestic if they are U.S. citizens or Green Card holders, all other players are considered international and must occupy an <i>International Roster Spot</i>. All clubs are allocated eight <i>International Roster Spots</i> for each season, though they may trade these Spots amongst themselves.</p>

			<p><b>These <i>International Roster Spots</i> naturally provide value in flexibility.</b> Teams looking to fill a particular role on the team have more options when they may choose between both domestic and international players. In the 2017 season, teams tended to trade $50,000 to $75,000 for an <i>International Roster Spot</i>. In 2018, that number has increased to north of $100,000. While this seems to be the market value of an International Roster Spot, it’s certainly fair to ask, is it worth it?</p>

			<p>This tool attempts to answer this question. By comparing the salaries of international and domestic players, our tool helps determine just how valuable the flexibility offered by an <i>International Roster Spot</i> is. <b>Further, we segment our analysis by both on-field role and quality</b>. <b>For example, an <i>International Roster Spot</i> might be more valuable applied toward an elite defensive midfielder, of which there are few inexpensive domestic options, than toward an average goalkeeper, of which there are many inexpensive domestic options</b>.</p>

			<p><i>Methodology</i></p>
			<ol>
				<li>Employ clustering of on-field data to group players with similar on-field roles.</li>
				<li>Use a rating system to stratify players into three tiers (rotational, average, and elite) based on overall quality, within each on-field role.<span class="Apple-converted-space"> </span></li>
				<li>For cohorts of players with the same on-field role and quality (i.e. all rotational full backs or all elite off-the-shoulder forwards), identify the least expensive domestic option by yearly salary, as the least expensive option among all players, both domestic and international.</li>
				<li>The difference between the least expensive option of all players and the least expensive option of domestic players represents the option value of the <i>International Roster Spot</i> applied at that particular role and quality tier.</li>
			</ol>

			<p>Using the tool, club decision-makers can select from drop-down menus the desired role and quality of the roster spot they’re looking to fill. Then, by pressing the ‘Search’ button, they can view the MLS players and respective salaries available to them with and without an <i>International Roster Spot</i>, ranked from least to most expensive. Finally, <b>the tool calculates and displays the theoretical savings offered by the flexibility of the <i>International Roster Spot</i> at that particular combination of role and quality.</b></p>

			<p>For example, the combination of role and quality for which use of an <i>International Roster Spot </i>offers the most value is elite center forwards, at a value of roughly $230,000. This makes sense intuitively as elite American center forwards playing domestically are difficult to come by, and those that are available are generally national team players with high salaries due partially to significant commercial value.</p>

			<p>On the other hand, we find that an <i>International Roster Spot </i>offers essentially no value when used on an average center back. This is also intuitive because there is a significant supply of average MLS American center backs.</p>

			<p>Ultimately, this tool is the first step in a new method of valuing aspects of the MLS roster regulatory system. This type of analysis can offer clubs critical insight as they trade non-player assets within the MLS economy. Critically, <b>while this particular tool focuses on <i>International Roster Spots</i>, the methodology is applicable to other types of assets, such as draft picks and allocation money.</b></p>
		</div>
	);
};

class Search extends Component {
	constructor() {
		super();
		this.state = {
			searchResults: [],
			clusters: [],
		};
	}

	handleSearch( event ) {
		event.preventDefault();

		const cluster = event.target.style.value;
		const quality = event.target.quality.value;

		fetch( `http://${ API_ENDPOINT }/players?cluster=${ cluster }&quality=${ quality }` )
			.then( res => res.json() )
			.then( body => {
				this.setState({ searchResults: body.data });
			} )
	}

	componentDidMount() {
		fetch( `http://${ API_ENDPOINT }/clusters` )
			.then( res => res.json() )
			.then( body => {
				this.setState({ clusters: body.data });
			} );
	}

	render() {
		let welcome, domestic, all, savings;
		if ( this.state.searchResults && this.state.searchResults.length ) {
			const firstDomestic = this.state.searchResults.find( player => ! player.international );
			const firstInternational = this.state.searchResults.find( player => !! player.international );

			let domesticWage = 0, internationalWage = 0;
			if ( firstDomestic && firstDomestic.wage ) {
				domesticWage = firstDomestic.wage;
			}

			if ( firstInternational && firstInternational.wage ) {
				internationalWage = firstInternational.wage;
			}

			let savingsWage = internationalWage - domesticWage;
			if ( savingsWage < 0 ) {
				savingsWage = 0;
			}

			if ( ! internationalWage || ! domesticWage ) {
				savings = <p id="savings">Savings: N/A</p>;
			} else {
				savings = (
					<p id="savings">Savings: ${ savingsWage }</p>
				);
			}

			domestic = (
				<div>
					<h2>Domestic only</h2>
					<small>(Does not require international roster spot)</small>
					<ul>
					{
						this.state.searchResults.map( ( player, key ) => {
							if ( player.international ) {
								return;
							}

							return <PlayerRow key={ key } player={ player } />;
						} )
					}
					</ul>
				</div>
			);

			all = (
				<div>
					<h2>All</h2>
					<ul>
					{
						this.state.searchResults.map( ( player, key ) => {
							return <PlayerRow key={ key } player={ player } />;
						} )
					}
					</ul>
				</div>
			);
		} else {
			welcome = (
				<h1>MLS International Roster Spot Valuation Tool</h1>
			);
		}

		return (
			<div>
				<form onSubmit={ this.handleSearch.bind( this ) }>
					<p><label>Role:<br />
						<select name="style">
							<option>Pick one</option>
							{
								this.state.clusters.map( cluster => {
									return <option value={ cluster.cluster }>{ cluster.cluster }</option>;
								} )
							}
						</select>
					</label></p>

					<p><label>Quality:<br />
						<select name="quality">
							<option>Pick one</option>
							<option value="1">Elite</option>
							<option value="2">Average</option>
							<option value="3">Rotational</option>
						</select>
					</label></p>

					<p><input type="submit" value="Search" /></p>
				</form>

				{ welcome }

				{ savings }
				<div className="comparison">
					<div className="group domestic">{ domestic }</div>
					<div className="group all">{ all }</div>
				</div>
			</div>
		);
	}
}

function playerImage( player ) {
	let image;
	if ( player.link ) {
		const link = player.link;
		const parts = link.split( '/' );
		const sofifaID = parts[ parts.length - 1 ];
		image = `https://cdn.sofifa.org/players/10/18/${ sofifaID }@2x.png`
	}

	return <img src={ image } />;
}

const PlayerRow = ({ player }) => (
	<li className="playerRow">
		{ playerImage( player ) }
		<span>
			<Link to={ `/${ player.player_id }` }>{ player.player_name }</Link>
			<span className="wage">${ player.wage }</span>
		</span>
	</li>
);

class Player extends Component {
	constructor({ match }) {
		super();
		this.state = {
			match: match,
			player: {},
		};
	}

	componentDidMount() {
		fetch( `http://${ API_ENDPOINT }/players/${ this.state.match.params.id }` )
			.then( res => res.json() )
			.then( body => {
				this.setState({ player: body });
			} )
			.catch( err => {
				// TODO
			} );
	}

	render() {
		let image;
		if ( this.state.player.link ) {
			const link = this.state.player.link;
			const parts = link.split( '/' );
			const sofifaID = parts[ parts.length - 1 ];
			image = `https://cdn.sofifa.org/players/10/18/${ sofifaID }@2x.png`
		}

		return (
			<div className="player">
				<h1>{ this.state.player.player_name }</h1>
				<img src={ image } />
				<ul>
					<li>Team: { this.state.player.current_team }</li>
					<li>Position: { this.state.player.cluster }</li>
					<li>Wage: ${ this.state.player.wage }</li>
				</ul>
			</div>
		);
	}
}

class Compare extends Component {
	constructor({ match }) {
		super();
		this.state = {
			match: match,
			players: [],
		};
	}

	componentDidMount() {
		fetch( `http://${ API_ENDPOINT }/players/${ this.state.match.params.id }/compare/${ this.state.match.params.id2 }` )
			.then( res => res.json() )
			.then( body => {
				this.setState({ players: body });
			} )
			.catch( err => {
				// TODO
			} );
	}

	render() {
		return (
			<div className="comparePlayers">
				{
					this.state.players.map( ( player, key ) => {
						let image;
						if ( player.link ) {
							const link = player.link;
							const parts = link.split( '/' );
							const sofifaID = parts[ parts.length - 1 ];
							image = `https://cdn.sofifa.org/players/10/18/${ sofifaID }@2x.png`
						}

						return (
							<div className="player" key={key}>
								<h1>{ player.player_name }</h1>
								<img src={ image } />
								<ul>
									<li>Team: { player.current_team }</li>
									<li>Position: { player.cluster }</li>
									<li>Wage: ${ player.wage }</li>
								</ul>
							</div>
						);
					} )
				}
			</div>
		);
	}
}

export default App;
