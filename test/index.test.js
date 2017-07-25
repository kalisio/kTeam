import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import core, { kaelia } from 'kCore'
import team from '../src'

describe('kTeam', () => {
  let app, adminDb, userService, orgService, groupService, userObject, orgObject, groupObject

  before(() => {
    chailint(chai, util)

    app = kaelia()
    return app.db.connect()
    .then(db => {
      adminDb = app.db.instance.admin()
    })
  })

  it('is CommonJS compatible', () => {
    expect(typeof team).to.equal('function')
  })

  it('registers the user/organisation service', () => {
    app.configure(core)
    userService = app.getService('users')
    expect(userService).toExist()
    app.configure(team)
    orgService = app.getService('organisations')
    expect(orgService).toExist()
  })

  it('creates an organization', () => {
    return orgService.create({ name: 'test-org' })
    .then(org => {
      return orgService.find({ query: { name: 'test-org' } })
      .then(orgs => {
        expect(orgs.data.length > 0).beTrue()
        orgObject = orgs.data[0]
        expect(orgObject.name).to.equal('test-org')
        // This should create a service for organisation groups
        groupService = app.getService('groups', org)
        expect(groupService).toExist()
        // We do not test creation of the DB here since MongoDB does not actually
        // creates it until the first document has been inserted (see next test)
      })
    })
  })

  it('creates an organization group', () => {
    return groupService.create({ name: 'test-group' })
    .then(_ => {
      return groupService.find({ query: { name: 'test-group' } })
      .then(groups => {
        expect(groups.data.length > 0).beTrue()
        groupObject = groups.data[0]
        expect(groupObject.name).to.equal('test-group')
        // Now this should have created DB for organisation
        return adminDb.listDatabases()
        .then(dbs => {
          expect(dbs.databases.find(db => db.name === orgObject._id.toString())).toExist()
        })
      })
    })
  })

  it('removes an organization group', () => {
    return groupService.remove(groupObject._id)
    .then(_ => {
      return groupService.find({ query: { name: 'test-group' } })
      .then(groups => {
        expect(groups.data.length === 0).beTrue()
      })
    })
  })

  it('removes an organization', () => {
    return orgService.remove(orgObject._id)
    .then(org => {
      return orgService.find({ query: { name: 'test-org' } })
      .then(orgs => {
        expect(orgs.data.length === 0).beTrue()
        // Should remove associated DB
        return adminDb.listDatabases()
        .then(dbs => {
          expect(dbs.databases.find(db => db.name === orgObject._id.toString())).beUndefined()
        })
      })
    })
  })

  it('creates a private organization on user registration', () => {
    return userService.create({ email: 'test@test.org', name: 'test-user' })
    .then(user => {
      userObject = user
      return orgService.find({ query: { name: 'test-user' } })
      .then(orgs => {
        expect(orgs.data.length > 0).beTrue()
      })
    })
  })

  it('removes private organization on user removal', () => {
    return userService.remove(userObject._id)
    .then(org => {
      return orgService.find({ query: { name: 'test-user' } })
      .then(orgs => {
        expect(orgs.data.length === 0).beTrue()
      })
    })
  })

  // Cleanup
  after(() => {
    userService.Model.drop()
    orgService.Model.drop()
    groupService.Model.drop()
    app.db.instance.dropDatabase()
  })
})
