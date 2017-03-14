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
    indent:indent,
    state: node.children ? 'expanded' : 'child'
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
      } else if(node.state == 'child') {
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

const TimelineHeader = React.createClass({
  render() {
    const width = '99px';

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
      divisions.push(<div style={style}>{this.props.start.clone().add(i, 'month').format('MMM YY')}</div>);
    }

    const style = {
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
    const totalDivs = this.props.end.diff(this.props.start, this.props.scale);
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

const Timeline = React.createClass({
  getInitialState() {
    const flat = this.props.data.map(f => flattenTree(f, 0)).reduce(concat, []);

    const firstStart = moment.min(flat.map(x => x.start).filter(x => x));
    const lastEnd = moment.max(flat.map(x => x.end).filter(x => x));

    const maxTime = lastEnd - firstStart;

    flat.forEach(node => {
      if(node.end && node.start) {
        node.percent = (node.end - node.start) * 100 / maxTime;
        node.left = (node.start - firstStart) * 100 /maxTime;
      }
      // set the callbacks for the parent nodes
      if(node.state != 'child') {
        node.clickBehavior = {
          collapsed: () => {
            console.log('clicked');
            node.state = 'expanded';
            this.setState({flat: flat});
          },
          expanded: () => {
            console.log('clicked');
            node.state = 'collapsed'
            this.setState({flat: flat});
          }
        };
      }
    });

    return {
      flat: flat,
      firstStart: firstStart,
      lastEnd: lastEnd,
      maxTime: maxTime
    };
  },
  render() {
    let collapsed = undefined;
    const expanded = this.state.flat.reduce((nodes, node) => {
      console.log(collapsed + ' <? ' + node.indent);
      if(collapsed < node.indent) return nodes;
      collapsed = undefined;
      if(node.state == 'collapsed') {
        collapsed = node.indent;
      }
      return nodes.concat(node);
    }, []);

    return (<Grid>
      <Row is="nospace">
        <Cell is="3 nospace"><DescriptorColumn flat={expanded} /></Cell>
        <Cell is="9 nospace">
          <TimelineRows flat={expanded} start={this.state.firstStart} end={this.state.lastEnd} scale='month' />
        </Cell>
      </Row>
    </Grid>);
  }
});

export {Timeline};
