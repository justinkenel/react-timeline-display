import React from 'react';
import ReactDom from 'react-dom';
import {Timeline} from './Timeline.jsx';
import moment from 'moment';

const testData = [
  {
    name: 'Fellowship of the Ring',
    children: [
      {
        name: 'Frodo',
        start: moment('2017-01').toDate(),
        end: moment('2017-03').toDate()
      },
      {
        name: 'Sam',
        start: moment('2016-05').toDate(),
        end: moment('2017-01').toDate()
      }
    ]
  },
  {
    name: 'Two Towers',
    start: moment('2016-08').toDate(),
    end: moment('2017-02').toDate()
  },
  {
    name: 'The Return of the King'
  }
];

ReactDom.render(<Timeline data={testData}/>, document.getElementById('react'));
