module.exports = {
  'vue-devtools e2e tests': function (browser) {
    browser
    .url('http://localhost:' + (process.env.PORT || 8081))
      .waitForElementVisible('.app', 5000)
      .assert.containsText('.message', 'Ready. Detected Vue')
      .assert.elementPresent('.instance')
      .assert.containsText('.instance', 'Root')

      // select instance
      .click('.instance .self')
      .assert.cssClassPresent('.instance', 'selected')
      .assert.visible('.inspector .main')
      .assert.containsText('.component-name', 'Root')
      .assert.elementPresent('.data-field')
      .assert.containsText('.data-field', 'obj: Object')

      // should expand root by default
      .assert.elementCount('.instance', 4)

      // select child instance
      .click('.instance .instance:nth-child(1) .self')
      .assert.containsText('.component-name', 'Counter')
      .assert.containsText('.data-field', 'test: 1 computed')
      .assert.containsText('.data-field:nth-child(2)', 'count: 0 vuex getter')

      // expand child instance
      .click('.instance .instance:nth-child(2) .arrow-wrapper')
      .assert.elementCount('.instance', 6)

      // add/remove component from app side
      .frame('target')
        .click('.add')
        .frame(null)
      .assert.elementCount('.instance', 9)
      .frame('target')
        .click('.remove')
        .frame(null)
      .assert.elementCount('.instance', 8)

      // filter components
      .setValue('.search-box', 'counter')
      .assert.elementCount('.instance', 1)
      .clearValue('.search-box')
      .setValue('.search-box', 'target')
      .assert.elementCount('.instance', 5)

      // vuex
      .frame('target')
        .click('.increment')
        .click('.increment')
        .click('.decrement')
        .assert.containsText('#counter p', '1')
        .frame(null)
      .click('.button.vuex')
      .assert.elementCount('.history .entry', 4)
      .assert.containsText('.vuex-state-inspector', 'type: "DECREMENT"')
      .assert.containsText('.vuex-state-inspector', 'count: 1')

      // time travel
      .click('.history .entry:nth-child(3)')
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'active')
      .assert.containsText('.vuex-state-inspector', 'type: "INCREMENT"')
      .assert.containsText('.vuex-state-inspector', 'count: 2')
      .frame('target')
        .assert.containsText('#counter p', '2')
        .frame(null)

      .click('.history .entry:nth-child(2)')
      .assert.cssClassPresent('.history .entry:nth-child(2)', 'active')
      .assert.containsText('.vuex-state-inspector', 'type: "INCREMENT"')
      .assert.containsText('.vuex-state-inspector', 'count: 1')
      .frame('target')
        .assert.containsText('#counter p', '1')
        .frame(null)

      .click('.history .entry:nth-child(1)')
      .assert.cssClassPresent('.history .entry:nth-child(1)', 'active')
      .assert.containsText('.vuex-state-inspector', 'count: 0')
      .frame('target')
        .assert.containsText('#counter p', '0')
        .frame(null)

      // revert
      .click('.history .entry:nth-child(4)')
      .click('.history .entry:nth-child(4) .action:nth-child(2)')
      .assert.elementCount('.history .entry', 3)
      .assert.cssClassPresent('.history .entry:nth-child(3)', 'active')
      .assert.containsText('.vuex-state-inspector', 'count: 2')
      .frame('target')
        .assert.containsText('#counter p', '2')
        .frame(null)

      // commit
      .click('.history .entry:nth-child(3) .action')
      .assert.elementCount('.history .entry', 1)
      .assert.cssClassPresent('.history .entry:nth-child(1)', 'active')
      .assert.containsText('.vuex-state-inspector', 'count: 2')
      .frame('target')
        .assert.containsText('#counter p', '2')
        .frame(null)

      // done
      .end()
  }
}
