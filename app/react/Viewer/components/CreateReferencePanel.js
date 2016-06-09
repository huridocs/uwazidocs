import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import 'app/Viewer/scss/createmodal.scss';

import SidePanel from 'app/Layout/SidePanel';
import ViewerSearchForm from 'app/Viewer/components/ViewerSearchForm';
import SearchResults from 'app/Viewer/components/SearchResults';
import {selectTargetDocument} from 'app/Viewer/actions/uiActions';

export class CreateReferencePanel extends Component {
  render() {
    let sidePanelprops = {open: this.props.open};
    return (
      <SidePanel {...sidePanelprops} className="create-reference">
        <h1>Create document reference</h1>

        <ViewerSearchForm />

        <SearchResults
          results={this.props.results}
          searching={this.props.searching}
          selected={this.props.selected}
          onClick={this.props.selectTargetDocument}
        />

      </SidePanel>
    );
  }
}

CreateReferencePanel.propTypes = {
  open: PropTypes.bool,
  results: PropTypes.object,
  searching: PropTypes.bool,
  selected: PropTypes.string,
  selectTargetDocument: PropTypes.func
};

const mapStateToProps = (state) => {
  let uiState = state.documentViewer.uiState.toJS();
  return {
    open: uiState.panel === 'referencePanel' || uiState.panel === 'targetReferencePanel',
    results: state.documentViewer.results,
    searching: uiState.viewerSearching,
    selected: uiState.reference.targetDocument
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({selectTargetDocument}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateReferencePanel);
