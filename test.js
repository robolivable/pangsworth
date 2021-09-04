require("fake-indexeddb/auto")

var {World} = require('./src/clients/game-objects')

var w = new World({id:6063})

w.fetch().then(o => {
  console.log(o)
})
