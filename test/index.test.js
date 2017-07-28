import chai, { util, expect } from 'chai'
import chailint from 'chai-lint'
import core, { kaelia } from 'kCore'
import team from '../src'

describe('kTeam', () => {
  let app, adminDb,
    userService, orgService, authorisationService, orgGroupService, orgUserService,
    userObject, orgObject, groupObject

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

  it('creates a private organisation on user registration', () => {
    return userService.create({ email: 'test@test.org', name: 'test-user' })
    .then(user => {
      userObject = user
      expect(userObject.organisations).toExist()
      // By default the user manage its own organisation
      expect(userObject.organisations[0].permissions).to.deep.equal('*')
      return orgService.find({ query: { name: 'test-user' } })
      .then(orgs => {
        expect(orgs.data.length > 0).beTrue()
      })
    })
  })

  it('creates an organisation', () => {
    return orgService.create({ name: 'test-org' }, { owner: userObject })
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
    return userService.find({ query: { name: userObject.name } })
    .then(users => {
      // User is found on the global service
      expect(users.data.length > 0).beTrue()
      return orgUserService.find({ query: { name: userObject.name } })
      .then(users => {
        // User is also found on the org service (owner by default)
        expect(users.data.length > 0).beTrue()
        // Remove membership for the user
        return authorisationService.remove(null, {
          subjects: [userObject],
          subjectsService: 'users',
          query: {
            scope: 'organisations',
            permissions: '*'
          },
          resource: orgObject,
          resourcesService: 'organisations'
        })
        .then(authorisation => {
          return orgUserService.find({ query: { name: userObject.name } })
          .then(users => {
            // But not now on the org if no membership
            expect(users.data.length === 0).beTrue()
          })
        })
      })
    })
  })

  it('creates an organisation group', () => {
    return orgGroupService.create({ name: 'test-group' })
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
    return orgGroupService.remove(groupObject._id)
    .then(_ => {
      return orgGroupService.find({ query: { name: groupObject.name } })
      .then(groups => {
        expect(groups.data.length === 0).beTrue()
      })
    })
  })

  it('removes an organisation', () => {
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

  it('removes private organisation on user removal', () => {
    return userService.remove(userObject._id)
    .then(org => {
      return orgService.find({ query: { name: userObject.name } })
      .then(orgs => {
        expect(orgs.data.length === 0).beTrue()
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
