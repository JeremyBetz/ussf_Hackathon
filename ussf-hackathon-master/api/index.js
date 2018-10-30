const express = require( 'express' );
const app = express();
const bodyParser = require( 'body-parser' );

app.use( bodyParser.urlencoded({
	extended: true,
	limit: '1gb',
}) );

app.use( bodyParser.json({
	limit: '1gb',
}) );

app.all( '*', function( req, res, next ) {
	res.header( 'Access-Control-Allow-Origin', '*' );
	res.header( 'Access-Control-Allow-Headers', 'accept, content-type' );
	res.header( 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE' );

	next();
});

const mysql = require('mysql');
const connection = mysql.createConnection({
	host     : 'db',
	user     : 'ussf',
	password : 'secret',
	database : 'ussf',
});

app.get( '/', ( req, res ) => {
	connection.query( 'SELECT 1 FROM `players`', function ( err, results ) {
		if ( err ) {
			return next( err );
		}

		return res.send( 'It works!' );
	});
} );

app.get( '/search', ( req, res, next ) => {
	connection.query({
		sql: 'SELECT * FROM `players` WHERE player_name LIKE ?',
		values: [ `%${ req.query.q }%` ],
	}, function( err, results ) {
		if ( err ) {
			return next( err );
		}

		return res.send({
			page: 1,
			pagesize: 10,
			data: results,
		});
	} );
} );

app.get( '/clusters', ( req, res, next ) => {
	connection.query({
		sql: 'SELECT DISTINCT `cluster` FROM `players`',
	}, function( err, results ) {
		if ( err ) {
			return next( err );
		}

		return res.send({
			data: results,
		});
	} );
} );

app.get( '/players', ( req, res, next ) => {
	const { cluster, quality } = req.query;

	const values = [];
	let sql = 'SELECT * FROM `players` WHERE 1=1';

	if ( cluster ) {
		sql += ' AND `cluster` = ?';
		values.push( cluster );
	}

	if ( quality ) {
		switch ( quality ) {
		case '1':
			sql += ' AND `quality` > 70';
			break;
		case '2':
			sql += ' AND `quality` > 60 AND `quality` <= 70';
			break;
		case '3':
			sql += ' AND `quality` <= 60';
			break;
		}
	}

	sql += ' ORDER BY `wage` ASC LIMIT 100';

	connection.query({ sql, values }, function( err, results ) {
		if ( err ) {
			return next( err );
		}

		return res.send({
			data: results,
		});
	} );
} );

app.post( '/players', ( req, res, next ) => {
	const { player_name, current_team, link, wage, cluster, quality, international } = req.body;
	const parsedWage = parseInt( wage, 10 );

	connection.query({
		sql: 'INSERT INTO `players` (player_name,current_team,link,wage,cluster,quality,international) VALUES (?,?,?,?,?,?,?)',
		values: [ player_name, current_team, link, parsedWage, cluster, quality, international ],
	}, function( err, results ) {
		if ( err ) {
			return next( err );
		}

		return res.status( 201 ).send( results );
	} );
} );

app.put( '/players/:playerId', ( req, res, next ) => {
	connection.query({
		sql: 'UPDATE `players` ( `field`, `commercial` ) VALUES ( ?, ? ) WHERE player_id = ?',
		values: [ req.body.field, req.body.commercial, req.params.playerId ],
	}, function( err, results ) {
		if ( err ) {
			return next( err );
		}

		return res.send( results );
	} );
} );

app.get( '/players/:playerId', ( req, res, next ) => {
	connection.query({
		sql: 'SELECT * FROM `players` WHERE `player_id` = ?',
		values: [ req.params.playerId ],
	}, function ( err, results ) {
		if ( err ) {
			return next( err );
		}

		if ( ! results || ! results.length ) {
			return next();
		}

		return res.send( results.pop() );
	} );
} );

app.get( '/players/:playerId/compare/:comparisonId', ( req, res, next ) => {
	connection.query({
		sql: 'SELECT * FROM `players` WHERE player_id = ? OR player_id = ? LIMIT 2',
		values: [ req.params.playerId, req.params.comparisonId ]
	}, function ( err, results ) {
		if ( err ) {
			return next( err );
		}

		if ( ! results || ! results.length || results.length < 2 ) {
			return next();
		}

		return res.send( results );
	} );
} );

app.use( ( req, res, next ) => {
	return res.status( 404 ).send( 'Requested resource was not found' );
} );

app.use( ( err, req, res, next ) => {
	console.error( err );
	return res.status( 500 ).send( 'Unknown error occurred' );
} );

const server = app.listen( process.env.PORT || 3000, () => {
	const { address, port } = server.address();
	console.log( 'Example app listening on port [%s]:%s!', address, port );
});
