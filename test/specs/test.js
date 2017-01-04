module.exports = {
  'vue-devtools e2e tests': function (browser) {
    browser
    .url('http://localhost:' + (process.env.PORT || 8081))
      .waitForElementVisible('.message', 1000)
      .assert.containsText('.message', 'Ready. Detected Vue')
      .assert.elementPresent('.instance')
      .assert.containsText('.instance', 'Root')

      // select instance
      .click('.instance .self')
      .assert.cssClassPresent('.instance', 'selected')
      .assert.visible('.tree')
      .assert.containsText('.component-name', 'Root')
      .assert.elementPresent('.data-field')
      .assert.containsText('.data-field', 'obj: Object')

      // should expand root by default
      .assert.count('.instance', 5)

      // select child instance
      .click('.instance .instance:nth-child(1) .self')
      .assert.containsText('.component-name', 'Counter')
      .assert.containsText('.data-field', 'count: 0 computed')
      .assert.containsText('.data-field:nth-child(2)', 'hello: undefined')
      .assert.containsText('.data-field:nth-child(3)', 'test: 1 computed')

      // expand child instance
      .click('.instance .instance:nth-child(2) .arrow-wrapper')
      .assert.count('.instance', 7)

      // add/remove component from app side
      .frame('target')
        .click('.add')
        .frame(null)
      .assert.count('.instance', 10)
      .frame('target')
        .click('.remove')
        .frame(null)
      .assert.count('.instance', 9)

      // filter components
      .setValue('.search input', 'counter')
      .assert.count('.instance', 1)
      .clearValue('.search input')
      .setValue('.search input', 'target')
      .assert.count('.instance', 5)

      // vuex
      .frame('target')
        .click('.increment')
        .click('.increment')
        .click('.decrement')
        .assert.containsText('#counter p', '1')
        .frame(null)
      .click('.button.vuex')
      .assert.count('.history .entry', 4)
      .assert.containsText('.vuex-state-inspector', 'type: "DECREMENT"')
      .assert.containsText('.vuex-state-inspector', 'count: 1')
      .assert.cssClassPresent('.history .entry:nth-child(4)', 'inspected')
      .assert.cssClassPresent('.history .entry:nth-child(4)', 'active')

      // filtering
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

      // inspecting
      .click('.history .entry:nth-child(3)')
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'inspected')
      .assert.cssClassNotPresent('.history .entry:nth-child(3)', 'active')
      .assert.containsText('.vuex-state-inspector', 'type: "INCREMENT"')
      .assert.containsText('.vuex-state-inspector', 'count: 2')
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

      .click('.history .entry:nth-child(2)')
      .assert.cssClassPresent('.history .entry:nth-child(2)', 'inspected')
      .assert.cssClassNotPresent('.history .entry:nth-child(2)', 'active')
      .assert.cssClassNotPresent('.history .entry:nth-child(3)', 'inspected')
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'active')
      .assert.containsText('.vuex-state-inspector', 'type: "INCREMENT"')
      .assert.containsText('.vuex-state-inspector', 'count: 1')
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
      .click('.history .entry:nth-child(1)')
      .assert.cssClassPresent('.history .entry:nth-child(1)', 'inspected')
      .assert.cssClassNotPresent('.history .entry:nth-child(1)', 'active')
      .assert.containsText('.vuex-state-inspector', 'count: 0')
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
      .click('.history .entry:nth-child(4)')
      .click('.history .entry:nth-child(4) .action:nth-child(2)')
      .assert.count('.history .entry', 3)
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'active')
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'inspected')
      .assert.containsText('.vuex-state-inspector', 'count: 2')
      .frame('target')
        .assert.containsText('#counter p', '2')
        .frame(null)

      // commit
      .click('.history .entry:nth-child(3) .action')
      .assert.count('.history .entry', 1)
      .assert.cssClassPresent('.history .entry:nth-child(1)', 'active')
      .assert.cssClassPresent('.history .entry:nth-child(1)', 'inspected')
      .assert.containsText('.vuex-state-inspector', 'count: 2')
      .frame('target')
        .assert.containsText('#counter p', '2')
        .frame(null)

      // copy vuex state
      .click('.export')
      .waitFor(100)
      .assert.containsText('.export .message', '(Copied to clipboard!)')
      .waitForElementNotVisible('.export .message', 3000)

      // import vuex state
      .click('.import')
      .assert.elementPresent('.import-state')
      .setValue('.import-state textarea', '{invalid: json}')
      .waitForElementVisible('.message.invalid-json', 100)
      .clearValue('.import-state textarea')
      .setValue('.import-state textarea', '{"valid": "json"}')
      .waitForElementNotVisible('.message.invalid-json', 1000)
      .assert.containsText('.vuex-state-inspector', 'valid: "json"')
      .click('.import')
      .waitForElementNotPresent('.import-state', 2000)

      // done
      .end()
  }
}
