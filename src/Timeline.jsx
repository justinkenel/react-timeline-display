import React from 'react';
import ReactDom from 'react-dom';
import {Grid, Row, Cell} from 'react-inline-grid';
import moment from 'moment';

function concat(a, n) { return a.concat(n); }

function flattenTree(node, indent) {
  indent = indent || 0;
  const x = {
    name:node.name,
    start:node.start && moment(node.start),
    end:node.end && moment(node.end),
    indent:indent,
    id:node.id || node.name,
    fields:node.fields || {},
    type:node.children ? 'parent' : 'child'
  };
  if(!node.children) { return [x]; }
  return node.children.map(child => flattenTree(child, indent+1)).reduce(concat, [x]);
}

const DescriptorColumn = React.createClass({
  render() {
    const iconMap = {
      expanded: 'fa fa-plus',
      collapsed: 'fa fa-minus'
    };

    const descriptorNodes = this.props.flat.map(node => {
      let leftPadding = 15*(node.indent+1);
      if(iconMap[node.state]) leftPadding -= 10;
      else if(node.indent == 0) leftPadding += 7;
      const style = {
        paddingLeft: leftPadding + 'px',
        borderBottom: 'solid 1px #D3D3D3',
        paddingBottom: '6px',
        marginTop: '6px',
        height: '18px',
        fontFamily: 'arial',
        color: 'gray'
      };

      if(iconMap[node.state]) {
        const iconStyle = {
          paddingRight: '3px',
          cursor: 'pointer'
        };
        return (<div style={style}>
          <i style={iconStyle} className={iconMap[node.state]} onClick={node.clickBehavior[node.state]}/>
          {node.name}
        </div>);
      } else if(node.type == 'child') {
        return <div style={style}>{node.name}</div>;
      }
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

const scales = {
  month: {
    diff(start, end) {
      return end.clone().add(1,'month').startOf('month').diff(start, 'month');
    },
    header(date, offset) {
      return date.clone().add(offset, 'month').format('MMM YY');
    },
    firstStart(dates) {
      return moment.min(dates.map(x => x.clone().startOf('month')));
    },
    lastEnd(dates) {
      return moment.max(dates.map(x => x.clone().endOf('month')));
    }
  },
  year: {
    diff(start, end) {
      return end.clone().add(1,'year').startOf('year').diff(start, 'year');
    },
    header(date, offset) {
      return date.clone().add(offset, 'year').format('YYYY');
    },
    firstStart(dates) {
      return moment.min(dates.map(x => x.clone().startOf('year')));
    },
    lastEnd(dates) {
      return moment.max(dates.map(x => x.clone().endOf('year')));
    }
  }
};

const TimelineHeader = React.createClass({
  render() {
    // const width = '99px';
    const width = (100/this.props.totalDivs) + '%';

    const scale = scales[this.props.scale];
    const divisions = [];
    for(let i=0; i<this.props.totalDivs; i++) {
      const style = {
        width: width,
        top: '0px',
        height: '24px',
        borderRight: i+1<this.props.totalDivs && 'solid 1px #D3D3D3',
        display: 'inline-block',
        fontFamily: 'arial',
        color: 'gray',
        textAlign: 'center',
        paddingTop: '6px'
      };
      divisions.push(<div style={style}>{scale.header(this.props.start, i)}</div>);
    }

    const style = {
      minWidth: '100%',
      width: this.props.rowWidth + 'px',
      display: 'inline-flex',
      borderBottom: 'solid 1px #D3D3D3',
      paddingRight: '2px',
      paddingLeft: '2px'
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
      minWidth: '100%',
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
      };
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
    const totalDivs = scales[this.props.scale].diff(this.props.start, this.props.end);
    const rowWidth = totalDivs * 100;

    const header = (<TimelineHeader
      totalDivs={totalDivs}
      scale={this.props.scale}
      start={this.props.start}
      rowWidth={rowWidth}
      end={this.props.end}/>);

    const rows = [header]
      .concat(this.props.flat.map(node => <TimelineRow rowWidth={rowWidth} node={node} />));
    const style = {
      borderTop: 'solid 1px #D3D3D3',
      borderRight: 'solid 1px #D3D3D3',
      overflowX: 'scroll',
      width: '100%',
      display: 'inline-block'
    }
    return (<div style={style}>{rows}</div>);
  }
});

const FieldRows = React.createClass({
  render() {
    const descriptorNodes = this.props.flat.map(node => {
      const style = {
        paddingLeft: '5px',
        paddingRight: '5px',
        borderBottom: 'solid 1px #D3D3D3',
        paddingBottom: '6px',
        marginTop: '6px',
        height: '18px',
        fontFamily: 'arial',
        textAlign: 'center',
        color: 'gray'
      };
      return <div style={style}>{node.fields[this.props.field] || ''}</div>;
    });
    const headerStyle = {
      height:'24px',
      textAlign: 'center',
      paddingTop: '6px',
      width: '100%',
      borderBottom: 'solid 1px #D3D3D3',
      fontFamily: 'arial',
      display: 'inline-block',
      color: 'gray'
    };
    const nodes = [(<div style={headerStyle}>{this.props.field}</div>)].concat(descriptorNodes);
    const style = {
      borderTop: 'solid 1px #D3D3D3',
      borderRight: 'solid 1px #D3D3D3',
      overflow: 'hidden'
    };
    return <div style={style}>{nodes}</div>;
  }
});

const Timeline = React.createClass({
  getInitialState() {
    return {
      collapsed: {}
    }
  },
  render() {
    const scale = scales[this.props.scale || 'month'];
    if(!scale) {
      throw "Invalid scale [" + this.props.scale + "] provided. Must be one of: " + Object.keys(scales);
    }

    const flat = this.props.data.map(f => flattenTree(f, 0)).reduce(concat, []);
    const firstStart = scale.firstStart(flat.map(x => x.start).filter(x => x));
    const lastEnd = scale.lastEnd(flat.map(x => x.end).filter(x => x));

    const maxTime = lastEnd - firstStart;

    flat.forEach(node => {
      if(node.end && node.start) {
        node.percent = (node.end - node.start) * 100 / maxTime;
        node.left = (node.start - firstStart) * 100 /maxTime;
      }
      // set the callbacks for the parent nodes
      if(node.type != 'child') {
        node.state = this.state.collapsed[node.id] ? 'collapsed' : 'expanded';
        node.clickBehavior = {
          collapsed: () => {
            delete this.state.collapsed[node.id];
            this.setState({collapsed: this.state.collapsed});
          },
          expanded: () => {
            this.state.collapsed[node.id] = true;
            this.setState({collapsed: this.state.collapsed});
          }
        };
      }
    });

    let collapsed = undefined;
    const expanded = flat.reduce((nodes, node) => {
      if(collapsed < node.indent) return nodes;
      collapsed = undefined;
      if(node.state == 'collapsed') {
        collapsed = node.indent;
      }
      return nodes.concat(node);
    }, []);

    const descriptorColumn = <Cell is="3 nospace"><DescriptorColumn flat={expanded} /></Cell>;

    let fieldColumns;
    if(this.props.fields) {
      if(this.props.fields.length > 2) {
        throw "Invalid property fields - maximum additional fields is 2";
      }
      fieldColumns = this.props.fields.map(f => (<Cell is="1 nospace"><FieldRows field={f} flat={expanded} /></Cell>));
    }

    const timelineColumnCount = 9 - (this.props.fields ? this.props.fields.length : 0);
    const timelineRows = (<Cell is={timelineColumnCount + " nospace"}>
      <TimelineRows flat={expanded}
        start={firstStart}
        end={lastEnd}
        scale={this.props.scale || 'month'} />
    </Cell>);

    const options = {
      gutter: '0',
      deaf: true
    };

    return (<Grid options={options}>
      <Row is="nospace">
        {descriptorColumn}
        {fieldColumns || []}
        {timelineRows}
      </Row>
    </Grid>);
  }
});

Timeline.render = (options, element) => {
  if(!options.data) {
    throw "Invalid parameters: options.data must be provided"
  }
  ReactDom.render(<Timeline data={options.data}
    fields={options.fields}
    scale={options.scale}/>, element);
};

export default Timeline;
export {Timeline};
