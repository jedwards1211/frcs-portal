#!/usr/bin/env babel-node

import r from './rethinkdriver'
import repl from 'repl'
import vm from 'vm'

const local = repl.start({
  prompt: "rethinkdb> ",
  eval: (cmd, context, filename, callback) => {
    const _context = vm.createContext(context)

    let result
    try {
      result = vm.runInContext(cmd, _context)
    } catch (err) {
      return callback(err)
    }
    if (result && result.run instanceof Function) result = result.run()
    if (result && result.then instanceof Function) {
      return result.then(res => callback(null, res), err => callback(err))
    } else {
      return callback(null, result)
    }
  }
})
local.context.r = r
