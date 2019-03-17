import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';

import styles from './ChartFeedPanel.less';
import { chartConfigs } from './ChartConfig';

const { Option } = Select;

@connect(({ tchart }) => ({
  tchart,
}))
class ChartFeedPanel extends PureComponent {
  render() {
    const { tchart, dispatch } = this.props;
    const { chartType, currentDataset, feeds } = tchart;
    const chartConfig = chartConfigs.find(chartType);
    const fields = [];

    if (currentDataset.columns) {
      currentDataset.columns.map(col => fields.push(col.key));
    }

    const fieldsList = fields.map(value => {
      return <Option key={value}>{value}</Option>;
    });

    const buildSelect = (type, children, single) => {
      const hint = `please select ${type}`;
      const value = feeds[type];
      const handleChange = value => {
        const feed = {};
        feed[type] = value;
        dispatch({
          type: 'tchart/updateFeeds',
          payload: feed,
        });
        const newFeeds = { ...tchart.feeds, ...feed };
        if (chartConfig && chartConfig.length > 0) {
          const grammar = chartConfig[0].build(newFeeds);
          dispatch({
            type: 'tchart/updateGrammar',
            payload: grammar,
          });
        }
      };
      return (
        <Select
          showSearch
          mode={single ? '' : 'tags'}
          placeholder={hint}
          onChange={handleChange}
          style={{ width: '100%' }}
          value={value}
        >
          {children}
        </Select>
      );
    };

    if (chartConfig && chartConfig.length > 0) {
      const feedSelectors = chartConfig[0].feeds.map(feed => {
        const single = !(feed.max > 1);
        const content = buildSelect(feed.name, fieldsList, single);
        return (
          <li key={feed.name}>
            {feed.name}:{content}
          </li>
        );
      });

      return <div className={styles.chartFeed}>{feedSelectors}</div>;
    }

    return <div className={styles.chartFeed} />;
  }
}

export default ChartFeedPanel;