import path from 'path'
import logger from 'winston'
import fs from 'fs-extra'
import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import { kaelia } from 'kCore'
import team from '../src'

describe('kTeam', () => {
  let app, orgService, groupService, orgObject, groupObject

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
      orgObject = org
      expect(org).toExist()
      expect(org.name).to.equal('test-org')
      // This should create a service for organisation groups
      groupService = app.getContextualService(org, 'groups')
      expect(groupService).toExist()
    })
  })

  it('creates an organization group', () => {
    return groupService.create({ name: 'test-group' })
    .then(group => {
      groupObject = group
      expect(group).toExist()
      expect(group.name).to.equal('test-group')
    })
  })

  it('removes an organization group', () => {
    return groupService.remove(groupObject._id)
    .then(group => {
      expect(group).toExist()
      expect(group.name).to.equal('test-group')
    })
  })

  it('removes an organization', () => {
    return orgService.remove(orgObject._id)
    .then(org => {
      expect(org).toExist()
      expect(org.name).to.equal('test-org')
    })
  })
})
