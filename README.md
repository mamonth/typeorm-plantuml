# typeorm-uml

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/typeorm-uml.svg)](https://www.npmjs.com/package/typeorm-uml)
[![Downloads/week](https://img.shields.io/npm/dw/typeorm-uml.svg)](https://www.npmjs.com/package/typeorm-uml)
[![License](https://img.shields.io/npm/l/typeorm-uml.svg)](https://github.com/eugene-manuilov/typeorm-uml/blob/master/package.json)

A command line tool to generate UML diagrams for Typeorm projects. It uses [plantuml](https://plantuml.com/) to render diagrams and outputs an URL to a diagram.

## Installation

Install this command as a development dependency to your project:

```sh-session
npm i -D typeorm-uml
```

## Usage

Add a new script to your `package.json` to be able to run it:

```json
{
    "name": "myproject",
    "scripts": {
        "db:diagram": "typeorm-uml ormconfig.json"
    }
}
```

Then run `npm run db:diagram` and you will receive an URL to an image with your diagram. You can use this URL to add to your README file or you can download the image and add it to your repository.

## Synopsis

```sh-session
USAGE
  $ typeorm-uml [CONFIGNAME]

ARGUMENTS
  CONFIGNAME  [default: ormconfig.json] Path to the Typeorm config file.

OPTIONS
  -D, --direction=(TB|LR)          [default: TB] Arrows directions. TB=top to bottom, LR=left to right.
  -c, --connection=connection      [default: default] The connection name.
  -d, --download=download          The filename where to download the diagram.
  -e, --exclude=exclude            Comma-separated list of entities to exclude from the diagram.
  -f, --format=(png|svg|txt|puml)  [default: png] The diagram file format.
  -i, --include=include            Comma-separated list of entities to include into the diagram.
  --color=pkey=#aaa                Custom colors to use for the diagram.
  --handwritten                    Whether or not to use handwritten mode.
  --monochrome                     Whether or not to use monochrome colors.
  --plantuml-url=plantuml-url      [default: http://www.plantuml.com/plantuml] URL of the plantuml server to use.
  --with-entity-names-only         Whether or not to display only entity names and hide database table names.
  --with-enum-values               Whether or not to show possible values for the enum type field.
  --with-table-names-only          Whether or not to display only database table names and hide entity names.
```

## Defining custom colors

If you want to override colors used in the diagram, you can do it using `--color` flag. It accepts the key-value pair where key is an element and value is a color. You can use multiple `--color` flags to override multiple elements. For example:

```sh-session
typeorm-uml path/to/ormconfig.json --color class.ArrowColor=#ff9900 --color class.BorderColor=#ff9900 --color class.BackgroundColor=#efefef --color column=#ddd
```

You can use `pkey`, `fkey` and `column` colors to override entity column icons, and `class.BackgroundColor`, `class.BorderColor`, `class.ArrowColor` to override enity class styles.

## Typescript

If you use `.ts` entities in your Typeorm config, then run this command with `ts-node` like this:

```sh-session
ts-node ./node_modules/.bin/typeorm-uml ormconfig.json
```

## PlantUML

Under the hood, this library uses the [PlantUML Language](https://plantuml.com/) to define diagrams and the [official plantuml server](http://www.plantuml.com/plantuml) to draw it.

In most cases, it's fine to use it without a doubt. However, it's not always the case. If you work on a project that has a strict security level and you can't use the public server, then you can set up your own using the [official docker image](https://hub.docker.com/r/plantuml/plantuml-server) of PlantUML server and use the `--plantuml-url` flag to let this library know its location.

## Run Programmatically

You can also import the `TypeormUml` class from this package and build UML diagrams on your own. See this small example:

```typescript
import { EOL } from 'os';
import { join } from 'path';

import { Direction, Flags, Format, TypeormUml } from 'typeorm-uml';

const configPath = join( __dirname, 'path/to/ormconfig.json' );
const flags: Flags = {
    direction: Direction.LR,
    format: Format.SVG,
    handwritten: true,
};

const typeormUml = new TypeormUml();
typeormUml.build( configPath, flags ).then( ( url ) => {
    process.stdout.write( 'Diagram URL: ' + url + EOL );
} );
```

Please, pay attention that the `TypeormUml::build()` method also accepts connection instance itself, so you don't need to compose a configuration file if you don't have one in your project. Here is another small example of how it can be used in the `typeorm/typescript-example` project:

```typescript
import { EOL } from 'os';
import { join } from 'path';

import { Direction, Flags, Format, TypeormUml } from 'typeorm-uml';
import { createConnection } from 'typeorm';

createConnection().then( async ( connection ) => {
    const flags: Flags = {
        direction: Direction.LR,
        format: Format.SVG,
        handwritten: true,
    };

    const typeormUml = new TypeormUml();
    const url = await typeormUml.build( connection, flags );

    process.stdout.write( 'Diagram URL: ' + url + EOL );
} );
```

## Example

[**typeorm/typescript-example**](https://github.com/typeorm/typescript-example)

```sh-session
typeorm-uml --format=svg --with-table-names-only
```

[![typeorm/typescript-example](http://www.plantuml.com/plantuml/svg/ZPDHQzim4CVVzIbk7OmO4ae7UId6DCswhIzZX53sDcJh4el8EYDTICoIxpx9TXAJjQmssDBzxl-_aoK_U9QEjvKHueF2bRO8B7E38xIomZ6eFBuJGCkQ6xX9ywmBfRTvTdCHrHjiHli40ayBCkJklqYt-KP6eLsGoj9F8I5BRrkMmJxAp-BLITmfFyxQwn_DEJy4jfKTAfw-nZieAbHQJXmMvDHGAagj43oZG-AcHjy5AkIIL3yfj2iC2i5K0nFan4mLA1tSM9CLmc-qhQMJ5JZQMXLgM7Gm7SHDQ2_Q0xbWF02-b8fssgvX9Ot70IcbLJkdcT7sR00B8xs7FmB2zIYBpRejF8-hWbsf6LioSuvsNT2ZN3j4sod2Hq1t1OuYhB3TOfXBnZMvPWn5Fu84fB_COk5sPq4hIExX-SToT7UNG0ZtUm3nB4JqCblClyyMey_JQU37SusVv7aCTNXstkte7RxXk9bNZ0S9kEV8bq-_biE2iS3lVWKQ_MdOZDyabyPUfPTcOyhpTSCTEcLVuT3Mcxx7msHoEBIc_qqwpOLuGAlYx_eN)](http://www.plantuml.com/plantuml/svg/ZPDHQzim4CVVzIbk7OmO4ae7UId6DCswhIzZX53sDcJh4el8EYDTICoIxpx9TXAJjQmssDBzxl-_aoK_U9QEjvKHueF2bRO8B7E38xIomZ6eFBuJGCkQ6xX9ywmBfRTvTdCHrHjiHli40ayBCkJklqYt-KP6eLsGoj9F8I5BRrkMmJxAp-BLITmfFyxQwn_DEJy4jfKTAfw-nZieAbHQJXmMvDHGAagj43oZG-AcHjy5AkIIL3yfj2iC2i5K0nFan4mLA1tSM9CLmc-qhQMJ5JZQMXLgM7Gm7SHDQ2_Q0xbWF02-b8fssgvX9Ot70IcbLJkdcT7sR00B8xs7FmB2zIYBpRejF8-hWbsf6LioSuvsNT2ZN3j4sod2Hq1t1OuYhB3TOfXBnZMvPWn5Fu84fB_COk5sPq4hIExX-SToT7UNG0ZtUm3nB4JqCblClyyMey_JQU37SusVv7aCTNXstkte7RxXk9bNZ0S9kEV8bq-_biE2iS3lVWKQ_MdOZDyabyPUfPTcOyhpTSCTEcLVuT3Mcxx7msHoEBIc_qqwpOLuGAlYx_eN)

## Contribute

Want to help or have a suggestion? Open a [new ticket](https://github.com/eugene-manuilov/typeorm-uml/issues/new) and we can discuss it or submit a pull request.

## License

MIT
