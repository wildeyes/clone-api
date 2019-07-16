#!/usr/bin/env node
import { resolve } from 'path'
import prog from 'caporal'
import mkdirp from 'mkdirp-promise'
import * as lib from './lib'

mkdirp(lib.path.out)

prog
  .version('0.1.0')
  .command('start', 'clone api')
  .argument('<file>', 'yaml file to read', prog.STRING)
  .argument('[port]', 'which port to run host at', prog.INT, 1337)
  .action(async function(args, options, logger) {
    lib.start(resolve(process.cwd(), args.file), args.port)
  })

prog.parse(process.argv)
