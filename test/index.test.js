import path from 'path'
import logger from 'winston'
import fs from 'fs-extra'
import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import { kaelia } from 'kCore'
import team from '../src'

describe('kTeam', () => {
  let app, orgService, groupService

  before(() => {
    chailint(chai, util)

    app = kaelia()
    return app.db.connect()
  })

  it('is CommonJS compatible', () => {
    expect(typeof team).to.equal('function')
  })

  it('registers the organisation service', () => {
    app.configure(team)
    orgService = app.getService('organisations')
    expect(orgService).toExist()
  })

  it('creates an organization', () => {
    return orgService.create({ name: 'test-org' })
    .then(org => {
      // This should create a service for organisation groups
      groupService = app.getService(org._id + '/groups')
      expect(groupService).toExist()
    })
  })
})
