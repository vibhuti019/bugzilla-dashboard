import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import LinkIcon from '@material-ui/icons/Link';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import MUIDataTable from 'mui-datatables';
import { PRODUCT_COMPONENT } from '../../config';
import './index.css';
import sort from '../../utils/bugzilla/sort';

const styles = ({
  header: {
    margin: '0.5rem 0 0 0',
  },
  metric: {
    textAlign: 'center',
  },
});

const sortByComponentName = (a, b) => a.label.localeCompare(b.label);

// Custom styles to override default MUI theme
const getMuiTheme = () => createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  overrides: {
    MuiPaper: {
      root: {
        margin: '1.4rem 0',
      },
    },
    MUIDataTableBodyCell: {
      root: {
        textAlign: 'center',
      },
    },
    MuiLink: {
      root: {
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        fontSize: 12,
        textAlign: 'center',
      },
    },
    MuiTypography: {
      body2: {
        whiteSpace: 'pre',
        display: 'flex',
        justifyContent: 'flex-start',
      },
    },
    MuiTableCell: {
      head: {
        padding: 0,
        '&:nth-child(3)': {
          maxWidth: '8rem',
        },
      },
      body: {
        cursor: 'pointer',
      },
    },
    MUIDataTableHeadCell: {
      data: {
        padding: '0px 10px',
      },
      toolButton: {
        width: '100%',
        height: '100%',
      },
    },
  },
});

const getTableHeaders = (data, onComponentDetails) => {
  const firstHeader = {
    name: '',
    label: '',
    options: {
      filter: false,
      viewColumns: false,
      customBodyRender: value => (
        value
          ? (
            <Link
              href="/#"
              onClick={e => onComponentDetails(e, {
                componentKey: `${value.product}::${value.component}`,
                teamKey: value.teamKey,
              })}
              onKeyPress={e => onComponentDetails(e, {
                componentKey: `${value.product}::${value.component}`,
                teamKey: value.teamKey,
              })}
            >
              <LinkIcon />
              <Typography style={{ paddingLeft: 6, color: '#3f51b5' }} component="div">
                {value.label}
              </Typography>
            </Link>
          )
          : null
      ),
    },
  };

  const getColor = (value, key) => (key === 'P1Defect' && (value && value.count) > 0 ? 'red' : 'blue');

  const Headers = Object.entries(data).map(([key, { label, hidden: showColumn = false }]) => ({
    name: `${label}`,
    label,
    options: {
      filter: false,
      // If hidden is true for the column, show it in view column list
      viewColumns: showColumn,
      // If hidden is true, hide the column in the table by default
      display: !showColumn,
      customBodyRender: value => (
        <Link
          href={value ? value.link : '#'}
          target="_blank"
          style={{ color: getColor(value, key) }}
          rel="noopener noreferrer"

        >
          { value ? value.count : '' }
        </Link>
      ),
    },
  }));
  if (onComponentDetails) {
    return [firstHeader].concat(Headers);
  }
  return Headers;
};

const options = {
  filter: false,
  selectableRows: false,
  sort: true,
  responsive: 'stacked',
  rowsPerPage: 25,
  download: false,
  print: false,
  viewColumns: true,
  customSort: (data, index, order) => data.sort((a, b) => sort(a.data, b.data, index, order)),
};

/**
   * @description Add data according to the mui data-table
   * @param {PRODUCT_COMPONENT} query The Static object to map
   * @param {Array} metrics Object sent by the server for each row
   * sent from {Function} getBugzillaComponentsData
   * @returns Array<metric | null>
   */
const BZqueryToDataCount = (query, metrics) => (
  Object.keys(query).map(eachQuery => (metrics[eachQuery] ? metrics[eachQuery] : null))
);

/**
   * @description Add data according to the mui data-table
   * @param {Array} bugzillaComponents
   * @returns {Array}
   */
const getBugzillaComponentsData = bugzillaComponents => bugzillaComponents
  .sort(sortByComponentName)
  .map(({
    label, component, product, metrics = {}, teamKey = null,
  }) => (
    [
      {
        label,
        component,
        product,
        metrics,
        teamKey,
      },
    ].concat(BZqueryToDataCount(PRODUCT_COMPONENT, metrics))
  ));

const BugzillaComponents = ({
  title, bugzillaComponents, onComponentDetails,
}) => (
  bugzillaComponents.length > 0 && (
    <MuiThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title={title}
        data={getBugzillaComponentsData(bugzillaComponents)}
        columns={getTableHeaders(PRODUCT_COMPONENT, onComponentDetails)}
        options={options}
        className="components-table"
      />
    </MuiThemeProvider>
  )
);

BugzillaComponents.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  bugzillaComponents: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      product: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]).isRequired,
      component: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]).isRequired,
      metrics: PropTypes.shape({}),
    }),
  ).isRequired,
  onComponentDetails: PropTypes.func,
};

BugzillaComponents.defaultProps = {
  onComponentDetails: undefined,
};

export default withStyles(styles)(BugzillaComponents);
