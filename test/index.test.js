import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import core, { kaelia } from 'kCore'
import team, { hooks as teamHooks } from '../src'

describe('kTeam', () => {
  let app, adminDb,
    userService, orgService, authorisationService, orgGroupService, orgUserService,
    user1Object, user2Object, orgObject, groupObject

  before(() => {
    chailint(chai, util)

    app = kaelia()
    // Register authorisation hooks
    app.hooks({
      before: { all: teamHooks.processAbilities },
      after: { all: teamHooks.authorise }
    })
    return app.db.connect()
    .then(db => {
      adminDb = app.db.instance.admin()
    })
  })

  it('is CommonJS compatible', () => {
    expect(typeof team).to.equal('function')
  })

  it('registers the global services', () => {
    app.configure(core)
    userService = app.getService('users')
    expect(userService).toExist()
    app.configure(team)
    orgService = app.getService('organisations')
    expect(orgService).toExist()
    authorisationService = app.getService('authorisation')
    expect(authorisationService).toExist()
  })

  it('unauthorised users cannot create organisations', () => {
    return orgService.create({ name: 'test-org' })
    .catch(error => {
      expect(error).toExist()
      expect(error.name).to.equal('Forbidden')
    })
  })

  it('creates a test user', () => {
    return userService.create({ email: 'test-1@test.org', name: 'test-user-1' })
    .then(user => {
      user1Object = user
      return userService.find({ query: { name: 'test-user-1' } })
      .then(users => {
        expect(users.data.length > 0).beTrue()
      })
    })
  })

  it('creates a private organisation on user registration', () => {
    return userService.create({ email: 'test-2@test.org', name: 'test-user-2' })
    .then(user => {
      user2Object = user
      expect(user2Object.organisations).toExist()
      // By default the user manage its own organisation
      expect(user2Object.organisations[0].permissions).to.deep.equal('owner')
      return orgService.find({ query: { name: 'test-user-2' } })
      .then(orgs => {
        expect(orgs.data.length > 0).beTrue()
      })
    })
  })

  it('creates an organisation', () => {
    return orgService.create({ name: 'test-org' }, { user: user1Object })
    .then(org => {
      return orgService.find({ query: { name: 'test-org' } })
      .then(orgs => {
        expect(orgs.data.length > 0).beTrue()
        orgObject = orgs.data[0]
        expect(orgObject.name).to.equal('test-org')
        // This should create a service for organisation groups
        orgGroupService = app.getService('groups', org)
        expect(orgGroupService).toExist()
        // This should create a service for organisation users
        orgUserService = app.getService('users', org)
        expect(orgUserService).toExist()
        // We do not test creation of the DB here since MongoDB does not actually
        // creates it until the first document has been inserted (see next test)
      })
    })
  })

  it('restricted access to organisation users for members', () => {
    return userService.find({ query: { name: user2Object.name } })
    .then(users => {
      // User is found on the global service
      expect(users.data.length > 0).beTrue()
      return orgUserService.find({ query: { name: user2Object.name } })
      .then(users => {
        // User is not found on the org service while no membership
        expect(users.data.length === 0).beTrue()
        // Add membership for the user
        return authorisationService.update(null, {
          scope: 'organisations',
          permissions: 'manager'
        },
          {
            user: user1Object,
            subjects: [user2Object],
            subjectsService: userService,
            resource: orgObject,
            resourcesService: orgService
          })
        .then(authorisation => {
          return orgUserService.find({ query: { name: user2Object.name } })
          .then(users => {
            // Found now on the org with membership
            expect(users.data.length > 0).beTrue()
          })
        })
      })
    })
  })

  it('creates an organisation group', () => {
    return orgGroupService.create({ name: 'test-group' }, { user: user2Object })
    .then(_ => {
      return orgGroupService.find({ query: { name: 'test-group' } })
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

  it('removes an organisation group', () => {
    return orgGroupService.remove(groupObject._id, { user: user2Object })
    .then(_ => {
      return orgGroupService.find({ query: { name: groupObject.name } })
      .then(groups => {
        expect(groups.data.length === 0).beTrue()
      })
    })
  })

  it('removes an organisation', () => {
    return orgService.remove(orgObject._id, { user: user1Object })
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

  it('removes private organisation on user removal', () => {
    return userService.remove(user2Object._id, { user: user2Object })
    .then(org => {
      return orgService.find({ query: { name: user2Object.name } })
      .then(orgs => {
        expect(orgs.data.length === 0).beTrue()
      })
    })
  })

  it('removes test user', () => {
    return userService.remove(user1Object._id, { user: user1Object })
    .then(org => {
      return userService.find({ query: { name: user1Object.name } })
      .then(users => {
        expect(users.data.length === 0).beTrue()
      })
    })
  })

  // Cleanup
  after(() => {
    userService.Model.drop()
    orgService.Model.drop()
    orgGroupService.Model.drop()
    app.db.instance.dropDatabase()
  })
})
