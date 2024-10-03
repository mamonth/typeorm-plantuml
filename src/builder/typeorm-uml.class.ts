import { createWriteStream, writeFileSync } from 'fs';
import { get } from 'http';
import { basename, dirname, isAbsolute, resolve } from 'path';

import * as plantumlEncoder from 'plantuml-encoder';
import { ConnectionOptionsReader, DataSource } from 'typeorm';

import { Flags, Format, SkinParams } from '../types';
import { UmlBuilder } from './uml-builder.class';
import { Styles } from './styles.class';
import { MonochromeStyles, TextStyles } from './styles';

export class TypeormUml {

	/**
	 * Builds UML diagram.
	 *
	 * @async
	 * @public
	 * @param {string|DataSource} configNameOrConnection The typeorm config filename or connection instance.
	 * @param {Flags} flags Build flags.
	 * @returns {string} Diagram URL or UML code depending on selected format.
	 */
	public async build( configNameOrConnection: string | DataSource, flags: Flags ) : Promise<string> {
		const styles = this.getStyles( flags );
		const connection: DataSource = typeof configNameOrConnection === 'string'
			? await this.getConnection( configNameOrConnection, flags )
			: configNameOrConnection;

		const builder = new UmlBuilder( connection, flags, styles );
		const uml = await builder.buildUml();

		if ( connection.isInitialized ) {
			await connection.destroy();
		}

		if ( flags.format === Format.PUML ) {
			if ( flags.download ) {
				const path = this.getPath( flags.download );
				writeFileSync( path, uml );
			} else if ( flags.echo ) {
				process.stdout.write( `${ uml }\n` );
			}

			return uml;
		}

		const url = this.getUrl( uml, flags );
		if ( flags.download ) {
			await this.download( url, flags.download );
		} else if ( flags.echo ) {
			process.stdout.write( `${ url }\n` );
		}

		return url;
	}

	/**
	 * Creates and returns Typeorm connection based on selected configuration file.
	 *
	 * @async
	 * @private
	 * @param {string} configPath A path to Typeorm config file.
	 * @param {Flags} flags An object with command flags.
	 * @returns {DataSource} A connection instance.
	 */
	private async getConnection( configPath: string, flags: Flags ): Promise<DataSource> {
		let root = process.cwd();
		let configName = configPath;

		if ( isAbsolute( configName ) ) {
			root = dirname( configName );
			configName = basename( configName );
		}

		const cwd = dirname( resolve( root, configName ) );
		process.chdir( cwd );

		const connectionOptionsReader = new ConnectionOptionsReader( { root, configName } );
		const connectionOptions = await connectionOptionsReader.get( flags.connection || 'default' );
		const dataSource = new DataSource( connectionOptions );

		// @ts-ignore
		await dataSource.buildMetadatas();

		process.chdir( root );

		return dataSource;
	}

	/**
	 * Builds a plantuml URL and returns it.
	 *
	 * @private
	 * @param {string} uml The UML diagram.
	 * @param {Flags} flags An object with command flags.
	 * @returns {string} A plantuml string.
	 */
	private getUrl( uml: string, flags: Flags ): string {
		const encodedUml = plantumlEncoder.encode( uml );

		const format = encodeURIComponent( flags.format );
		const schema = encodeURIComponent( encodedUml );
		const plantumlUrl = flags['plantuml-url'] || 'http://www.plantuml.com/plantuml';

		return `${ plantumlUrl.replace( /\/$/, '' ) }/${ format }/${ schema }`;
	}

	/**
	 * Gets global proxy settings.
	 * @private
	 */
	private getHttpProxy() {
		const proxyHost = process.env.https_proxy || process.env.http_proxy;
		const proxyData = proxyHost?.match( /^(https?:\/\/)?([^:/]+)(:([0-9]+))?/i );
		const proxySecure = proxyHost?.startsWith( 'https:' );
		if ( !proxyData ) return;

		return {
			host: proxyData[2],
			port: ( proxyData[4] || ( proxySecure ? 443 : 80 ) ),
		};
	}

	/**
	 * Downloads image into a file.
	 *
	 * @private
	 * @param {string} url The URL to download.
	 * @param {string} filename The output filename.
	 * @returns {Promise} A promise object.
	 */
	private download( url: string, filename: string ): Promise<void> {
		const proxyData = this.getHttpProxy();
		const getOptions = !proxyData
			? url // no proxy no drama
			: {
				...proxyData,
				path: url,
				headers: {
					Host: ( new URL( url ) ).hostname,
				},
			};

		return new Promise( ( resolve ) => {
			get( getOptions, ( response ) => {
				response.pipe( createWriteStream( this.getPath( filename ) ) );
				response.on( 'end', resolve );
			} );
		} );
	}

	/**
	 * Get path for file.
	 *
	 * @private
	 * @param {string} filename The output filename.
	 * @returns {string} The resolved full path of file.
	 */
	private getPath( filename: string ): string {
		return !isAbsolute( filename ) ? resolve( process.cwd(), filename ) : filename;
	}

	/**
	 * Returns styles for the diagram.
	 *
	 * @private
	 * @param {Flags} flags The current flags to use.
	 * @returns {Styles} An instance of the Styles class.
	 */
	private getStyles( flags: Flags ): Styles {
		const args: SkinParams = {
			direction: flags.direction,
			handwritten: flags.handwritten ? 'true' : 'false',
			colors: flags.colors,
			entityNamesOnly: flags['with-entity-names-only'],
			tableNamesOnly: flags['with-table-names-only'],
		};

		if ( flags.monochrome ) {
			return new MonochromeStyles( args );
		}

		if ( flags.format === Format.TXT ) {
			return new TextStyles( args );
		}

		return new Styles( args );
	}

}
