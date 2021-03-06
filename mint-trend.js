import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import 'jquery';
import 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/data';
import 'highcharts/modules/exporting';
import 'highcharts/modules/drilldown';
import 'highcharts/modules/series-label';
import 'highcharts/modules/export-data';

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
         .select {
            position: relative;
            display: inline-block;
            margin-bottom: 15px;
            width: 100%;
          }
         .select select {
          display: inline-block;
          width: 100%;
          cursor: pointer;
          padding: 10px 15px;
          outline: 0;
          border: 0;
          border-radius: 0;
          background: #e6e6e6;
          color: #7b7b7b;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }
        .select select::-ms-expand {
          display: none;
        }
        .select select:hover,
        .select select:focus {
          color: #000;
          background: #ccc;
        }
        .select select:disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        .select__arrow {
          position: absolute;
          top: 16px;
          right: 15px;
          width: 0;
          height: 0;
          pointer-events: none;
          border-style: solid;
          border-width: 8px 5px 0 5px;
          border-color: #7b7b7b transparent transparent transparent;
        }
        .select select:hover ~ .select__arrow,
        .select select:focus ~ .select__arrow {
          border-top-color: #000;
        }
        .select select:disabled ~ .select__arrow {
          border-top-color: #ccc;
        }
      </style>
      <div class="select">
          <select id="trend_datasets">
             <option disabled="" selected="" value="">Please select one trend</option>
             <option value="fldas01_fldas02_trend_chart" data-url="http://jonsnow.usc.edu:8081/mintmap/csv/fldas01_fldas02_trend_chart.csv">Precipitation: FLDAS Jan vs FLDAS Feb Trend</option>
             <option value="fldas_chirps_trend_chart" data-url="http://jonsnow.usc.edu:8081/mintmap/csv/fldas_chirps_trend_chart.csv" data-connect-null="yes">Precipitation: FLDAS 2001(Jan and Feb) vs CHIRPS Yearly Trend</option>
             <option value="fewschips_2018_yearly_trend" data-url="http://jonsnow.usc.edu:8081/mintmap/csv/chirps_trend_chart.csv">Precipitation: CHIRPS Yearly Trend</option>
          </select>
          <div class="select__arrow"></div>
      </div>

      <div id="trend_chart_panel">
         
      </div>
      <slot></slot>
    `;
  }
  static get properties() {
    return {
      datasets: {
        type: Object,
        observer: '_configChanged',
        value: {}
      }
    }
  }
  _configChanged(newObj, oldObj) {
      // console.log(newObj);
      if (JSON.stringify(newObj) !== JSON.stringify(oldObj)) {
          this.initChart(newObj);
      }
  }
  initChart(obj){
    var self = this;
    if (typeof obj.id === "string" && obj.id.length > 0) {
        var trend = $(self.$.trend_datasets).find('option[value=' + obj.id + ']');
        if (trend.length > 0) {
          trend.prop('selected',true);
          self.selectTrend(obj.id);
        }
    }
  }
  ready(){
    super.ready();
    var self = this;
    $(self.$.trend_datasets).on('change',function (event) {
        if ($(this).val().length > 0) {
            self.selectTrend($(this).val())
        }
    })
  }
  selectTrend(optionValue){
    var self = this;
    var trend = $(self.$.trend_datasets).find('option[value=' + optionValue + ']');
    // console.log(trend.data('url'));
    if (trend.length === 0) {
      alert('No such trend data!');
      return;
    }
    var chartOption =  {
          chart: {
              type: 'line',
              zoomType: 'x'
          },
          title: {
              text: trend.html()
          },
          tooltip: {
              shared: true,
              crosshairs: true,
              useHTML: true,
              headerFormat: 'Day Index: {point.key}<table>',
              pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' + '<td style="text-align: right"><b>{point.y}</b></td></tr>',
              footerFormat: '</table>'
          },
          legend: {
              align: 'left',
              verticalAlign: 'top',
              borderWidth: 0
          },
          xAxis: {
              title: {
                text: ""
              },
              gridLineWidth: 1,
              labels: {
                  align: 'left',
              }
          },
          yAxis: [{ // left y axis
              title: {
                  text: null
              },
              labels: {
                  align: 'left',
                  x: 3,
                  y: 16,
                  format: '{value:.,0f}'
              },
              showFirstLabel: false
          }],

          plotOptions: {
              series: {
                  cursor: 'pointer',
                  connectNulls: trend.data('connect-null') === 'yes' ? true : false,
                  marker: {
                      lineWidth: 1
                  }
              }
          },
          series: []
    };
    var series = [];
    $.ajax({
      type: 'get',
      url: trend.data('url'),
      dataType: 'text',
      success: function(csv){
          csv = csv.replace(/null|"/g,'');
          var lines = csv.split('\n');
          lines.forEach(function(line, lineNo) {
              var items = line.split(',');
              if (lineNo == 0) {
                  items.forEach(function(item, itemNo) {
                      if (itemNo == 0) {
                        chartOption.tooltip.headerFormat = item + ': {point.key}<table>';
                        chartOption.xAxis.title.text = item;
                      }
                      if (itemNo > 0)
                        series.push({name:item,data: []});
                  });
              }else {
                  items.forEach(function(item, itemNo) {
                      if (itemNo == 0) {
                          // series.name = item;
                      } else {
                          series[itemNo-1].data.push(parseFloat(item));
                      }
                  });
              }
          });
          chartOption.series = series;
          self.chart = Highcharts.chart(self.$.trend_chart_panel, chartOption);
      }
    });
       
  }
}

window.customElements.define('mint-trend', MintTrend);
