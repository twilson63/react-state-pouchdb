var React = require('react')
var ReactDOM = require('react-dom')
var PouchDB = require('pouchdb')
var most = require('most')

/*

State management Database

*/
var db = new PouchDB('state', { revs_limit: 1, auto_compaction: true })

/*

Stateless React Apps

*/
function App (props) {
  return <div>
    <input id="foo"></input>
    <button id="bar">Click Me</button>
    <hr />
    <h1>{props.state.title}</h1>
  </div>
}


/*

check if a state doc exists

*/
db.get('state')
  .catch(err => {
    const state = { title: 'Enter a title and click the button'}

    ReactDOM.render(
      <App state={state}></App>,
      document.getElementById('app')
    )

  })

/*

if the bar button is clicked then update state

*/
most.fromEvent('click', document.body)
  .filter(ev => ev.srcElement.id === 'bar')
  // get foo value
  .map(ev => document.getElementById('foo').value)
  // clear out foo value
  .tap(value => document.getElementById('foo').value = '')
  // update state document
  .forEach(value => db.get('state')
    .then(doc => {
      doc.title = value
      return db.put(doc)
    })
    .catch(err => db.put({title: value }, 'state'))
  )

// listen for changes to state doc
most.fromEvent('change', db.changes({
  include_docs: true,
  live: true
}))
  .filter(chg => chg.doc._id === 'state')
  .forEach(chg => {
  // re-render application
  ReactDOM.render(
    <App state={chg.doc}></App>,
    document.getElementById('app')
  )
})
