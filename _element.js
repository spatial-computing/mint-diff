import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `mint-trend`
 * Mint Trend of Aggregation
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class MintTrend extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'mint-trend',
      },
    };
  }
}

window.customElements.define('mint-trend', MintTrend);
