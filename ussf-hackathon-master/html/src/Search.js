import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";

class Search extends Component {
	constructor() {
		super();
		this.state = {
			search: '',
			searchResults: [],
		};

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange( event ) {
		this.setState({ search: event.target.value });
	}

	handleSearch( event ) {
		event.preventDefault();

		fetch( `http://localhost:3000/search?q=${ this.state.search }` )
			.then( res => res.json() )
			.then( body => {
				this.setState({ searchResults: body });
			} )
	}

	render() {
		let results;
		if ( this.state.searchResults && this.state.searchResults.data ) {
			results = (
				<ul className="results">
					{
						this.state.searchResults.data.map( ( player, key ) => {
							const url = '/' + player.player_id;;
							return <li key={key}><Link onClick={ this.forceUpdate } to={ url }>{ player.player_name }</Link></li>;
						} )
					}
				</ul>
			);
		}

		return (
			<div className="search">
				<form onSubmit={ this.handleSearch.bind(this) }>
					<input type="text" value={ this.state.search } onChange={ this.handleChange }/>
					<input type="submit" value="Search" />
				</form>
				{ results }
			</div>
		);
	}
}

export default withRouter(Search);
