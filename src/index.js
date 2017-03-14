import React from 'react';
import ReactDom from 'react-dom';
import {Timeline} from './Timeline.jsx';
import moment from 'moment';

const testData = [
  {
    id: 'fellowship',
    name: 'Fellowship of the Ring',
    children: [
      {
        id: 'frodo',
        name: 'Frodo',
        start: moment('2017-01').toDate(),
        end: moment('2017-03').toDate(),
        fields: {
          Rings: 1
        }
      },
      {
        id: 'sam',
        name: 'Sam',
        start: moment('2016-05').toDate(),
        end: moment('2017-01').toDate()
      }
    ]
  },
  {
    id: 'two-towers',
    name: 'Two Towers',
    start: moment('2016-08').toDate(),
    end: moment('2017-02').toDate()
  },
  {
    id: 'return',
    name: 'The Return of the King'
  }
];

ReactDom.render((<div>
  <Timeline data={testData}/>
  <Timeline data={testData} fields={['Rings']}/>
  <Timeline data={testData} scale='year'/>
</div>), document.getElementById('react'));
