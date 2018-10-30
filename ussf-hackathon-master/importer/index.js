#!/usr/bin/env node

const FIELDS = [
	'player_name',
	'current_team',
	'link',
	'wage',
	'cluster',
	'quality',
	'international',
];

const { createReadStream } = require( 'fs' );
const parse = require( 'csv-parse' );
const request = require( 'superagent' );

if ( process.argv.length < 3 ) {
	return console.error( 'Usage: index.js <file.csv>' );
}

const file = createReadStream( process.argv[ 2 ] );
const parser = parse({ delimiter: ',' });
parser.on( 'readable', () => {
	let record, header;
	while( record = parser.read() ) {
		if ( ! header ) {
			header = record;
			continue;
		}

		const data = header.reduce( ( acc, value, i ) => ( acc[ value ] = record[ i ], acc ), {} );

		console.log( 'INSERT INTO \`players\` (player_name,current_team,link,wage,cluster,quality,international) VALUES ("%s","%s","%s",%d,"%s",%d,%d);',
			data[ 'player_name' ],
			data[ 'current_team' ],
			data[ 'link' ],
			data[ 'wage' ],
			data[ 'cluster' ],
			data[ 'quality' ],
			data[ 'international' ] );
	}
} );

file.pipe( parser );
