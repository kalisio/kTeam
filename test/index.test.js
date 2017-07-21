import path from 'path'
import logger from 'winston'
import fs from 'fs-extra'
import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import { kaelia } from 'kCore'
import team from '../src'

describe('kTeam', () => {
  let app

  before(() => {
    chailint(chai, util)

    app = kaelia()
    return app.db.connect()
  })

  it('is CommonJS compatible', () => {
    expect(typeof team).to.equal('function')
  })

  it('registers the organization service', () => {
    app.configure(team)
    let service = app.getService('organisations')
    expect(service).toExist()
  })
})
