import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
// import request from 'superagent'
import logger from 'winston'
import core, { kalisio } from 'kCore'
import team, { hooks as teamHooks } from '../src'

// Catch all at higher level
process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
)

describe('kTeam', () => {
  let app, adminDb, server, port, // baseUrl,
    userService, orgService, authorisationService, orgGroupService, orgUserService,
    user1Object, user2Object, orgObject, groupObject

  before(() => {
    chailint(chai, util)

    app = kalisio()
    port = app.get('port')
    // baseUrl = `http://localhost:${port}${app.get('apiPath')}`
    // Register authorisation hook
    app.hooks({
      before: { all: teamHooks.authorise }
      /* For debug
      before: { all: [coreHooks.log, teamHooks.authorise] },
      after: { all: coreHooks.log },
      error: { all: coreHooks.log }
      */
    })
    return app.db.connect()
    .then(db => {
      adminDb = app.db.instance.admin()
    })
  })

  it('is CommonJS compatible', () => {
    expect(typeof team).to.equal('function')
  })

  it('registers the global services', (done) => {
    app.configure(core)
    userService = app.getService('users')
    expect(userService).toExist()
    app.configure(team)
    orgService = app.getService('organisations')
    expect(orgService).toExist()
    authorisationService = app.getService('authorisations')
    expect(authorisationService).toExist()
    server = app.listen(port)
    server.once('listening', _ => done())
  })

  it('unregistered users cannot create organisations', (done) => {
    orgService.create({ name: 'test-org' }, { checkAuthorisation: true })
    .catch(error => {
      expect(error).toExist()
      expect(error.name).to.equal('Forbidden')
      done()
    })
    /*
    request
    .post(`${baseUrl}/organisations`)
    .send({ name: 'test-org' })
    .then(response => {
      console.log(response)
      expect(response).toExist()
    })
    */
  })

  it('creates a test user', () => {
    return userService.create({ email: 'test-1@test.org', name: 'test-user-1' }, { checkAuthorisation: true })
    .then(user => {
      user1Object = user
      return userService.find({ query: { name: 'test-user-1' }, checkAuthorisation: true })
    })
    .then(users => {
      expect(users.data.length > 0).beTrue()
    })
  })

  it('creates a private organisation on user registration', () => {
    return userService.create({ email: 'test-2@test.org', name: 'test-user-2' }, { checkAuthorisation: true })
    .then(user => {
      user2Object = user
      expect(user2Object.organisations).toExist()
      // By default the user manage its own organisation
      expect(user2Object.organisations[0].permissions).to.deep.equal('owner')
      return orgService.find({ query: { name: 'test-user-2' }, user: user2Object, checkAuthorisation: true })
    })
    .then(orgs => {
      expect(orgs.data.length > 0).beTrue()
    })
  })

  it('creates an organisation', () => {
    return orgService.create({ name: 'test-org' }, { user: user1Object, checkAuthorisation: true })
    .then(org => {
      return orgService.find({ query: { name: 'test-org' }, user: user1Object, checkAuthorisation: true })
    })
    .then(orgs => {
      expect(orgs.data.length > 0).beTrue()
      orgObject = orgs.data[0]
      expect(orgObject.name).to.equal('test-org')
      // This should create a service for organisation groups
      orgGroupService = app.getService('groups', orgObject)
      expect(orgGroupService).toExist()
      // This should create a service for organisation users
      orgUserService = app.getService('users', orgObject)
      expect(orgUserService).toExist()
      // We do not test creation of the DB here since MongoDB does not actually
      // creates it until the first document has been inserted (see next test)
    })
  })

  it('non-members cannot access organisation users', () => {
    return userService.find({ query: { name: user2Object.name }, user: user1Object, checkAuthorisation: true })
    .then(users => {
      // User is found on the global service
      expect(users.data.length > 0).beTrue()
      return orgUserService.find({ query: { name: user2Object.name }, user: user1Object, checkAuthorisation: true })
    })
    .then(users => {
      // User is not found on the org service while no membership
      expect(users.data.length === 0).beTrue()
    })
  })

  it('non-members cannot manage organisation permissions', (done) => {
    authorisationService.create({
      scope: 'organisations',
      permissions: 'member',
      subjects: user2Object._id.toString(),
      subjectsService: 'users',
      resource: orgObject._id.toString(),
      resourcesService: 'organisations'
    }, {
      user: user2Object,
      checkAuthorisation: true
    })
    .catch(error => {
      expect(error).toExist()
      expect(error.name).to.equal('Forbidden')
      done()
    })
  })

  it('owner can add organisation members', () => {
    return authorisationService.create({
      scope: 'organisations',
      permissions: 'member',
      subjects: user2Object._id.toString(),
      subjectsService: 'users',
      resource: orgObject._id.toString(),
      resourcesService: 'organisations'
    }, {
      user: user1Object,
      checkAuthorisation: true
    })
    .then(authorisation => {
      expect(authorisation).toExist()
      return userService.find({ query: { name: user2Object.name }, checkAuthorisation: true })
    })
    .then(users => {
      expect(users.data.length > 0).beTrue()
      user2Object = users.data[0]
      expect(user2Object.organisations[1].permissions).to.deep.equal('member')
    })
  })

  it('members can access organisation users', () => {
    return orgUserService.find({ query: { name: user2Object.name }, user: user2Object, checkAuthorisation: true })
    .then(users => {
      // Found now on the org with membership
      expect(users.data.length > 0).beTrue()
    })
  })

  it('members cannot create an organisation group', (done) => {
    orgGroupService.create({ name: 'test-group' }, { user: user2Object, checkAuthorisation: true })
    .catch(error => {
      expect(error).toExist()
      expect(error.name).to.equal('Forbidden')
      done()
    })
  })

  it('owner can add organisation managers', () => {
    return authorisationService.create({
      scope: 'organisations',
      permissions: 'manager',
      subjects: user2Object._id.toString(),
      subjectsService: 'users',
      resource: orgObject._id.toString(),
      resourcesService: 'organisations'
    }, {
      user: user1Object, checkAuthorisation: true
    })
    .then(authorisation => {
      expect(authorisation).toExist()
      return userService.find({ query: { name: user2Object.name }, checkAuthorisation: true })
    })
    .then(users => {
      expect(users.data.length > 0).beTrue()
      user2Object = users.data[0]
      expect(user2Object.organisations[1].permissions).to.deep.equal('manager')
    })
  })

  it('manager can create an organisation group', () => {
    return orgGroupService.create({ name: 'test-group' }, { user: user2Object, checkAuthorisation: true })
    .then(_ => {
      return orgGroupService.find({ query: { name: 'test-group' }, user: user2Object, checkAuthorisation: true })
    })
    .then(groups => {
      expect(groups.data.length > 0).beTrue()
      groupObject = groups.data[0]
      expect(groupObject.name).to.equal('test-group')
      // Now we have added some documents this should have created DB for organisation
      return adminDb.listDatabases()
    })
    .then(dbs => {
      expect(dbs.databases.find(db => db.name === orgObject._id.toString())).toExist()
    })
  })

  it('group owner can remove his organisation group', () => {
    return orgGroupService.remove(groupObject._id, { user: user2Object, checkAuthorisation: true })
    .then(_ => {
      return orgGroupService.find({ query: { name: groupObject.name }, user: user2Object, checkAuthorisation: true })
    })
    .then(groups => {
      expect(groups.data.length === 0).beTrue()
    })
  })

  it('owner can remove his organisation', () => {
    return orgService.remove(orgObject._id, { user: user1Object, checkAuthorisation: true })
    .then(org => {
      return orgService.find({ query: { name: 'test-org' }, user: user1Object, checkAuthorisation: true })
    })
    .then(orgs => {
      expect(orgs.data.length === 0).beTrue()
      // Should remove associated DB
      return adminDb.listDatabases()
    })
    .then(dbs => {
      expect(dbs.databases.find(db => db.name === orgObject._id.toString())).beUndefined()
    })
  })

  it('removes private organisation on user removal', () => {
    return userService.remove(user2Object._id, { user: user2Object, checkAuthorisation: true })
    .then(org => {
      return orgService.find({ query: { name: user2Object.name }, user: user2Object, checkAuthorisation: true })
    })
    .then(orgs => {
      expect(orgs.data.length === 0).beTrue()
    })
  })

  it('removes test user', () => {
    return userService.remove(user1Object._id, { user: user1Object, checkAuthorisation: true })
    .then(org => {
      return userService.find({ query: { name: user1Object.name }, user: user1Object, checkAuthorisation: true })
    })
    .then(users => {
      expect(users.data.length === 0).beTrue()
    })
  })

  // Cleanup
  after(() => {
    if (server) server.close()
    userService.Model.drop()
    orgService.Model.drop()
    orgGroupService.Model.drop()
    app.db.instance.dropDatabase()
  })
})
