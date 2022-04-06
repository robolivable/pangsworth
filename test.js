require('fake-indexeddb/auto')

const { World } = require('./src/clients/game-objects')

const w = new World({ id: 6063 })

w.fetch().then(o => {
  console.log(o)
})

//const { Search } = require('./src/clients/search')
//
//Search.New().then(async s => {
//  await s.hydrateIndex()
//  return s
//})
