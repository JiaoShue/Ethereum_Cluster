import { Card, Col, Row, Table } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';

let bizcharts;
if (process.browser) {
  bizcharts = require('bizcharts');
}
import DataSet from '@antv/data-set';


const PieChart = (props) => {
  const cols = {
    percent: {
      formatter: val => {
        val = val * 100 + '%';
        return val;
      }
    }
  };
  return process.browser ? (
    <bizcharts.Chart
      height={150}
      data={props.dataView}
      scale={cols}
      padding={[10, 10, 10, 10]}
      forceFit
    >
      <bizcharts.Guide>
        <bizcharts.Guide.Html
          position={['50%', '50%']}
          html={`<div style='text-align:center'>${props.title}<br>${props.value}</div>`}
          alignX="middle"
          alignY="middle"
        />
      </bizcharts.Guide>
      <bizcharts.Coord type={'theta'} radius={1} innerRadius={0.8}/>
      <bizcharts.Geom
        type="intervalStack"
        position="percent"
        color="item"
        tooltip={[
          'item*percent',
          (item, percent) => {
            percent = percent * 100 + '%';
            return {
              name: item,
              value: percent
            };
          }
        ]}
        style={{
          lineWidth: 1,
          stroke: '#fff'
        }}
      >
      </bizcharts.Geom>
    </bizcharts.Chart>
  ) : <div/>
};


export const NodeStatusCard = (props) => {
  const { DataView } = DataSet;
  const cpuDv = new DataView();
  const memDV = new DataView();
  let stats = props.stats;
  if (!props.stats) {
    stats = "";
  }
  let perf = ('{' + stats.split(': {')[1]).split('}')[0].split(',');
  if (!perf || !perf.length || perf.length < 2) {
    perf = ['cpu:0', 'mem:0'];
  }
  const name = stats.split(': {')[0];
  const cpuPerf = perf[0].split('cpu:')[1];
  const memPerf = perf[1].split('mem:')[1];
  const cpuData = [
    {
      item: '使用率',
      count: parseFloat(cpuPerf.split('%')[0])
    },
    {
      item: '空余率',
      count: 100 - parseFloat(cpuPerf.split('%')[0])
    }
  ];
  const memData = [
    {
      item: '用率',
      count: parseFloat(memPerf.split('%')[0])
    },
    {
      item: '余率',
      count: 100 - parseFloat(memPerf.split('%')[0])
    }
  ];
  cpuDv.source(cpuData).transform({
    type: 'percent',
    field: 'count',
    dimension: 'item',
    as: 'percent'
  });
  memDV.source(memData).transform({
    type: 'percent',
    field: 'count',
    dimension: 'item',
    as: 'percent'
  });
  const cols = {
    percent: {
      formatter: val => {
        val = val * 100 + '%';
        return val;
      }
    }
  };


  return (
    <Card title={<h4>集群健康状况：{name}</h4>}>
      <div>
        {process.browser && (
          <Row gutter={16}>
            <Col span="12">
              <PieChart dataView={cpuDv} title={'CPU占用率'} value={cpuPerf}/>
            </Col>
            <Col span="12">
              <bizcharts.Chart
                height={150}
                data={memDV}
                scale={cols}
                padding={[10, 10, 10, 10]}
                forceFit
              >
                <bizcharts.Guide>
                  <bizcharts.Guide.Html
                    position={['50%', '50%']}
                    html={`<div style='text-align:center'>内存占用率<br>${memPerf}</div>`}
                    alignX="middle"
                    alignY="middle"
                  />
                </bizcharts.Guide>
                <bizcharts.Coord type={'theta'} radius={1} innerRadius={0.8}/>
                <bizcharts.Geom
                  type="intervalStack"
                  position="percent"
                  color="item"
                  tooltip={[
                    'item*percent',
                    (item, percent) => {
                      percent = percent * 100 + '%';
                      return {
                        name: item,
                        value: percent
                      };
                    }
                  ]}
                  style={{
                    lineWidth: 1,
                    stroke: '#fff'
                  }}
                >
                </bizcharts.Geom>
              </bizcharts.Chart>
            </Col>
          </Row>
        )
        }
      </div>
    </Card>
  );
};
