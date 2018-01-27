module.exports = {
  beforeEach (browser, done) {
    browser.resizeWindow(1280, 800, done)
  },

  'vue-devtools e2e tests': function (browser) {
    var baseInstanceCount = 8

    browser
    .url('http://localhost:' + (process.env.PORT || 8081))
      .waitForElementVisible('.message', 1000)
      .waitFor(1000) // wait for entering animation
      .assert.containsText('.message', 'Ready. Detected Vue')
      .assert.elementPresent('.instance')
      .assert.containsText('.instance', 'Root')

      // should detect instances inside shadow DOM
      .assert.containsText('.tree > .instance:last-child', 'Shadow')

      // select instance
      .click('.instance .self')
      .assert.cssClassPresent('.instance', 'selected')
      .assert.visible('.tree')
      .assert.containsText('.action-header .title', 'Root')
      .assert.elementPresent('.data-field')
      .assert.containsText('.data-field', '$route')

      // should expand root by default
      .assert.count('.instance', baseInstanceCount)

      // select child instance
      .click('.instance .instance:nth-child(1) .self')
      .assert.containsText('.action-header .title', 'Counter')
      .assert.containsText('.data-el.vuex-bindings .data-field', 'count:0')
      .assert.containsText('.data-el.computed .data-field', 'test:1')
      .assert.containsText('.data-el.firebase-bindings .data-field', 'hello:undefined')

      // prop types
      .click('.instance .instance:nth-child(2) .self')
      .assert.containsText('.action-header .title', 'Target')
      .assert.containsText('.data-el.props .data-field:nth-child(1)', 'ins:Object')
      .assert.containsText('.data-el.props .data-field:nth-child(2)', 'msg:"hi"')
      .assert.containsText('.data-el.props .data-field:nth-child(3)', 'obj:undefined')
      // Regexp
      .assert.containsText('.data-el.data .data-field:nth-child(8)', 'regex:/(a\\w+b)/g')
      // Literals
      .assert.containsText('.data-el.data .data-field:nth-child(5)', 'NaN')
      .assert.containsText('.data-el.data .data-field:nth-child(2)', 'Infinity')
      .assert.containsText('.data-el.data .data-field:nth-child(6)', '-Infinity')

      // Classify names
      .assert.containsText('.instance .instance:nth-child(3)', 'OtherWithMine')
      .click('.button.classify-names')
      .assert.containsText('.instance .instance:nth-child(3)', 'other-with-mine')
      .click('.button.classify-names')
      .assert.containsText('.instance .instance:nth-child(3)', 'OtherWithMine')

      // expand child instance
      .click('.instance .instance:nth-child(2) .arrow-wrapper')
      .assert.count('.instance', baseInstanceCount + 2)

      // add/remove component from app side
      .frame('target')
        .click('.add')
        .frame(null)
      .assert.count('.instance', baseInstanceCount + 5)
      .frame('target')
        .click('.remove')
        .frame(null)
      .assert.count('.instance', baseInstanceCount + 4)

      // filter components
      .setValue('.search input', 'counter')
      .assert.count('.instance', 1)
      .clearValue('.search input')
      .setValue('.search input', 'target')
      .assert.count('.instance', 5)

      // Select component
      .click('.select-component')
      .frame('target')
        .moveToElement('.mine', 0, 0)
        .click('.mine')
        .frame(null)
      .useCss()
      .assert.containsText('.tree', `<Mine>`)
      .assert.containsText('.right.bottom .action-header', `Mine`)

      // vuex
      .frame('target')
        .click('.increment')
        .click('.increment')
        .click('.decrement')
        .assert.containsText('#counter p', '1')
        .frame(null)
      .click('.button.vuex')
      .assert.count('.history .entry', 4)
      .assert.containsText('.vuex-state-inspector', 'type:"DECREMENT"')
      .assert.containsText('.vuex-state-inspector', 'count:1')
      .assert.cssClassPresent('.history .entry:nth-child(4)', 'inspected')
      .assert.cssClassPresent('.history .entry:nth-child(4)', 'active')

      // filtering state & getters
      .setValue('.right .search input', 'cou')
      .assert.count('.data-field', 1)
      .clearValue('.right .search input')
      .setValue('.right .search input', 'no value')
      .assert.count('.data-field', 0)
      .clearValue('.right .search input')

      // filtering history
      .setValue('.search input', 'inc')
      .assert.count('.history .entry', 3)
      .assert.count('.history .entry.inspected', 0)
      .assert.count('.history .entry.active', 0)
      .clearValue('.search input')

      .setValue('.search input', '/dec/i')
      .assert.count('.history .entry', 2)
      .assert.count('.history .entry.inspected.active', 1)
      .clearValue('.search input')

      .setValue('.search input', '/dec)/i')
      .assert.count('.history .entry', 4)
      .assert.count('.history .entry.inspected.active', 1)
      .clearValue('.search input')

      // Clear filters (clearValue is buggy)
      .click('.button.components')
      .click('.button.vuex')

      // inspecting
      .click('.history .entry:nth-child(3) .mutation-type')
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'inspected')
      .assert.cssClassNotPresent('.history .entry:nth-child(3)', 'active')
      .assert.containsText('.vuex-state-inspector', 'type:"INCREMENT"')
      .assert.containsText('.vuex-state-inspector', 'count:2')
      .frame('target')
        .assert.containsText('#counter p', '1')
        .frame(null)
      // time-travel
      .click('.history .entry:nth-child(3) .entry-actions .action:nth-child(3)')
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'inspected')
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'active')
      .frame('target')
        .assert.containsText('#counter p', '2')
        .frame(null)

      .click('.history .entry:nth-child(2) .mutation-type')
      .assert.cssClassPresent('.history .entry:nth-child(2)', 'inspected')
      .assert.cssClassNotPresent('.history .entry:nth-child(2)', 'active')
      .assert.cssClassNotPresent('.history .entry:nth-child(3)', 'inspected')
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'active')
      .assert.containsText('.vuex-state-inspector', 'type:"INCREMENT"')
      .assert.containsText('.vuex-state-inspector', 'count:1')
      .frame('target')
        .assert.containsText('#counter p', '2')
        .frame(null)
      .click('.history .entry:nth-child(2) .entry-actions .action:nth-child(3)')
      .assert.cssClassPresent('.history .entry:nth-child(2)', 'inspected')
      .assert.cssClassPresent('.history .entry:nth-child(2)', 'active')
      .assert.cssClassNotPresent('.history .entry:nth-child(3)', 'active')
      .frame('target')
        .assert.containsText('#counter p', '1')
        .frame(null)

      // base state
      .click('.history .entry:nth-child(1) .mutation-type')
      .assert.cssClassPresent('.history .entry:nth-child(1)', 'inspected')
      .assert.cssClassNotPresent('.history .entry:nth-child(1)', 'active')
      .assert.containsText('.vuex-state-inspector', 'count:0')
      .frame('target')
        .assert.containsText('#counter p', '1')
        .frame(null)
      .click('.history .entry:nth-child(1) .entry-actions .action:nth-child(1)')
      .assert.cssClassPresent('.history .entry:nth-child(1)', 'inspected')
      .assert.cssClassPresent('.history .entry:nth-child(1)', 'active')
      .frame('target')
        .assert.containsText('#counter p', '0')
        .frame(null)

      // revert
      .click('.history .entry:nth-child(4) .mutation-type')
      .click('.history .entry:nth-child(4) .action:nth-child(2)')
      .assert.count('.history .entry', 3)
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'active')
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'inspected')
      .assert.containsText('.vuex-state-inspector', 'count:2')
      .frame('target')
        .assert.containsText('#counter p', '2')
        .frame(null)

      // commit
      .click('.history .entry:nth-child(3) .mutation-type')
      .click('.history .entry:nth-child(3) .action:nth-child(1)')
      .assert.count('.history .entry', 1)
      .assert.cssClassPresent('.history .entry:nth-child(1)', 'active')
      .assert.cssClassPresent('.history .entry:nth-child(1)', 'inspected')
      .assert.containsText('.vuex-state-inspector', 'count:2')
      .frame('target')
        .assert.containsText('#counter p', '2')
        .frame(null)

      // getters
      .assert.containsText('.vuex-state-inspector', 'isPositive:true')
      .frame('target')
        .click('.decrement')
        .click('.decrement')
        .click('.decrement')
        .frame(null)
      .click('.history .entry:nth-child(4)')
      .assert.containsText('.vuex-state-inspector', 'isPositive:false')

      // toggle recording
      .click('.toggle-recording')
      .assert.containsText('.toggle-recording', 'Paused')
      .assert.cssClassNotPresent('.toggle-recording .svg-icon', 'enabled')
      // should not record
      .frame('target')
        .click('.increment')
        .frame(null)
      .assert.count('.history .entry', 4)

      // copy vuex state
      .click('.export')
      .waitFor(100)
      .assert.containsText('.export .message', '(Copied to clipboard!)')
      .waitForElementNotVisible('.export .message', 3000)

      // import vuex state
      .click('.import')
      .assert.elementPresent('.import-state')
      .setValue('.import-state textarea', '{invalid: json}')
      .waitForElementVisible('.message.invalid-json', 200)
      .clearValue('.import-state textarea')
      .setValue('.import-state textarea', '{"count":42,"date":"[native Date Fri Dec 22 2017 10:12:04 GMT+0100 (CET)]"}')
      .waitForElementNotVisible('.message.invalid-json', 1000)
      .assert.containsText('.vuex-state-inspector', 'count:42')
      .assert.containsText('.vuex-state-inspector', 'date:' + new Date('Fri Dec 22 2017 10:12:04 GMT+0100 (CET)'))
      .click('.import')
      .waitForElementNotPresent('.import-state', 2000)

      // Events
      .frame('target')
        .click('.btn-emit-event')
        .click('.btn-emit-event1')
        .click('.btn-emit-event2')
        .frame(null)
      .assert.containsText('.event-count', 3)
      .click('.button.events')
      .assert.elementNotPresent('.event-count')
      .assert.count('.history .entry', 3)
      .frame('target')
        .click('.btn-emit-log-event')
        .frame(null)
      .assert.count('.history .entry', 4)
      .setValue('.search input', 'event')
      .assert.count('.history .entry', 3)
      .clearValue('.search input')
      .setValue('.search input', '<eventchild1>')
      .assert.count('.history .entry', 1)
      .clearValue('.search input')
      .click('.button.reset')
      .assert.count('.history .entry', 0)

      // done
      .end()
  }
}
