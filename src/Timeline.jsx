import React from 'react';
import {Grid, Row, Cell} from 'react-inline-grid';
import moment from 'moment';

function concat(a, n) { return a.concat(n); }

function flattenTree(node, indent) {
  indent = indent || 0;
  const x = {
    name:node.name,
    start:node.start && moment(node.start),
    end:node.end && moment(node.end),
    indent:indent
  };
  if(!node.children) { return [x]; }
  return node.children.map(child => flattenTree(child, indent+1)).reduce(concat, [x]);
}

const DescriptorColumn = React.createClass({
  render() {
    const descriptorNodes = this.props.flat.map(node => {
      const style = {
        paddingLeft: 15*(node.indent+1) + 'px',
        borderBottom: 'solid 1px #D3D3D3',
        paddingBottom: '6px',
        marginTop: '6px',
        height: '18px',
        fontFamily: 'arial',
        color: 'gray'
      };
      return <div style={style}>{node.name}</div>
    });

    const headerStyle = {
      height:'30px',
      borderBottom: 'solid 1px #D3D3D3'
    };
    const nodes = [(<div style={headerStyle}/>)].concat(descriptorNodes);

    const style = {
      borderTop: 'solid 1px #D3D3D3',
      borderLeft: 'solid 1px #D3D3D3',
      borderRight: 'solid 1px #D3D3D3'
    };
    return <div style={style}>{nodes}</div>;
  }
});

const TimelineDivisions = React.createClass({
  render() {
    const width = 100.0 / this.props.count;

    const divisions = [];
    for(let i=0; i<this.props.count; i++) {
      console.log(i);
      const style = {
        width: width + '%',
        left: (width * i) + '%',
        top: '0px',
        height: '30px',
        borderRight: 'solid 1px #D3D3D3',
        marginTop: '2px',
        display: 'inline-block'
      };
      divisions.push(<div style={style}/>);
    }

    const style = {
      display: 'block'
    };
    return (<div style={style}>{divisions}</div>);
  }
});

const TimelineRow = React.createClass({
  getInitialState() {
    return {
      hover: false
    }
  },
  render() {
    const node = this.props.node;
    const style = {
      height: '30px',
      borderBottom: 'solid 1px #D3D3D3',
      paddingRight: '2px',
      paddingLeft: '2px',
      width: this.props.rowWidth + 'px'
    };
    if(node.percent) {
      style.height = '28px';
      const s = {
        width: node.percent + '%',
        borderRadius: '4px',
        height: '26px',
        marginTop: '2px',
        backgroundColor: this.state.hover ? '#0066cc' : 'lightblue',
        marginLeft: node.left + '%'
      }
      return (<div style={style}>
        <div style={s} onMouseOver={() => this.setState({hover:true})}
          onMouseOut={() => this.setState({hover:false})} />
      </div>);
    }
    return (<div style={style} />);
  }
});

const TimelineRows = React.createClass({
  render() {
    const totalDivs = this.props.end.diff(this.props.start, this.props.scale);
    const rowWidth = totalDivs * 100;

    const rows = [<TimelineRow rowWidth={rowWidth} node={{}} />] // TODO: header
      .concat(this.props.flat.map(node => <TimelineRow rowWidth={rowWidth} node={node} />));
    const style = {
      borderTop: 'solid 1px #D3D3D3',
      borderRight: 'solid 1px #D3D3D3',
      overflowX: 'hidden',
      overflowY: 'hidden',
      width: '100%',
      display: 'inline-block'
    }
    return <div style={style}>{rows}</div>;
  }
});

const Timeline = React.createClass({
  render() {
    const flat = this.props.data.map(f => flattenTree(f, 0)).reduce(concat, []);

    const firstStart = moment.min(flat.map(x => x.start).filter(x => x));
    const lastEnd = moment.max(flat.map(x => x.end).filter(x => x));

    const maxTime = lastEnd - firstStart;

    flat.forEach(node => {
      if(node.end && node.start) {
        node.percent = (node.end - node.start) * 100 / maxTime;
        node.left = (node.start - firstStart) * 100 /maxTime;
        console.log(node.left);
      }
    });

    return (<Grid>
      <Row is="nospace">
        <Cell is="3 nospace"><DescriptorColumn flat={flat} /></Cell>
        <Cell is="9 nospace"><TimelineRows flat={flat} start={firstStart} end={lastEnd} scale='month' /></Cell>
      </Row>
    </Grid>);
  }
});

export {Timeline};
