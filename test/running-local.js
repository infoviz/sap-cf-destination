const rewire = require("rewire")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")

// set up the middleware
chai.use(chaiAsPromised)
chai.should()
const expect = chai.expect

// rewire for testing internal functions
const app = rewire("../index.js")
getAccessTokenForDestinationInstance = app.__get__("getAccessTokenForDestinationInstance")
getAccessTokenForProxy = app.__get__("getAccessTokenForProxy")
getDestination = app.__get__("getDestination")

describe("using helper functions in non-CF environment", () => {
    before(() => {
        // hard-wire "local" mode
        this.VCAP_APPLICATION = process.env.VCAP_APPLICATION
        delete process.env.VCAP_APPLICATION
    })

    it("getting an access token of the destination instance returns some mock token", () => {
        return getAccessTokenForDestinationInstance("someid", "somesecret", "http://ex.org").should.become(
            "mockLocalAccessToken"
        )
    })

    it("getting an access token of the connectivity instance returns some mock token", () => {
        return getAccessTokenForProxy("someid", "somesecret", "http://ex.org").should.become("mockLocalProxyToken")
    })

    it("retrieving the config for a destination should return the provided destination (name) appropriately nested", () => {
        let destinationName = "http://ex.org"
        let expected = JSON.stringify({
            destinationConfiguration: {
                URL: destinationName
            }
        })
        return getDestination(destinationName, "http://ex.org/api", "someToken").should.eventually.deep.equal(expected)
    })

    after(() => {
        // restore actual runtime env (if applicable)
        process.env.VCAP_APPLICATION = this.VCAP_APPLICATION
    })
})
