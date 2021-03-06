/* eslint-env mocha */
'use strict'

var expect = require('chai').expect
var streamPair = require('stream-pair')
var MultiStream = require('../../src/')
var lpm = require('length-prefixed-message')

describe('Implementation: one-way', function () {
  var msB
  var msS
  var listener
  var dialer

  before(() => {
    const pair = streamPair.create()
    dialer = pair
    listener = pair.other
  })

  it('create a Broadcast MultiStream', function () {
    msB = new MultiStream.Broadcast()
    expect(msB).to.be.an.instanceof(MultiStream.Broadcast)
  })

  it('create a Silent MultiStream()', function () {
    msS = new MultiStream.Silent()
    expect(msS).to.be.an.instanceof(MultiStream.Silent)
  })

  it('create a Broadcast MultiStream via utility function', function () {
    expect(
      MultiStream.Broadcast.createBroadcast()
    ).to.be.an.instanceof(
      MultiStream.Broadcast
    )
  })

  it('throw an error if Broadcast function is misused', function () {
    expect(
      () => MultiStream.Broadcast()
    ).to.throw(
      'Broadcast must be called with new, or used with Broadcast'
    )
  })

  it('attach a stream to Broadcast MultiStream (tcp server)', function () {
    msB.handle(listener)
  })

  it('Attach the silent receiver to the stream', function (done) {
    msS.handle(dialer, done)
  })

  it('create a Silent MultiStream via utility function', function () {
    expect(
      MultiStream.Silent.createSilent()
    ).to.be.an.instanceof(
      MultiStream.Silent
    )
  })

  it('throw an error if Silent function is misused', function () {
    expect(
      () => MultiStream.Silent()
    ).to.throw(
      'Silent must be called with new, or used with Silent'
    )
  })

  it('register a handler', function (done) {
    msS.addHandler('/bird/3.2.1', function (err, ds) {
      expect(err).to.equal(null)
      ds.on('data', function (data) {
        expect(data.toString()).to.equal('hey, how is it going?')
        done()
      })
    })

    msB.broadcast('/bird/3.2.1', function (ds) {
      ds.write('hey, how is it going?')
    })
  })

  it('closing socket for unsupported protocol', function (done) {
    const acc = new MultiStream.Silent()
    const pair = streamPair.create()
    dialer = pair
    listener = pair.other

    acc.handle(listener, (err) => {
      expect(
        err.message
      ).to.equal(
        'Received non supported MultiStream version /garbage/1.0.0'
      )
      done()
    })

    lpm.write(dialer, '/garbage/1.0.0\n')
  })
})
