import React from 'react';
import PropTypes from 'prop-types';
import reactMixin from 'react-mixin';
import autoBind from 'react-autobind';
import Reflux from 'reflux';
import DocumentTitle from 'react-document-title';
import Dropzone from 'react-dropzone';
import {searches} from 'js/searches';
import mixins from 'js/mixins';
import {t, validFileTypes} from 'js/utils';
import myLibraryStore from './myLibraryStore';
import {
  AssetsTable,
  ASSETS_TABLE_CONTEXTS,
  ASSETS_TABLE_COLUMNS
} from './assetsTable';

const defaultColumn = ASSETS_TABLE_COLUMNS.get('last-modified');

class LibraryAssetsList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: myLibraryStore.data.isFetchingData,
      assets: myLibraryStore.data.assets,
      orderBy: defaultColumn,
      isOrderAsc: defaultColumn.defaultIsOrderAsc,
      searchContext: searches.getSearchContext('library')
    };

    autoBind(this);
  }

  componentDidMount() {
    this.listenTo(myLibraryStore, this.myLibraryStoreChanged);
  }

  myLibraryStoreChanged() {
    this.setState({
      isLoading: myLibraryStore.data.isFetchingData,
      assets: myLibraryStore.data.assets
    });
  }

  onAssetsTableReorder(orderBy, isOrderAsc) {
    this.setState({
      orderBy,
      isOrderAsc
    });
    // TODO tell myLibraryStore that column header was clicked
  }

  render() {
    return (
      <DocumentTitle title={`${t('My Library')} | KoboToolbox`}>
        <Dropzone
          onDrop={this.dropFiles}
          disableClick
          multiple
          className='dropzone'
          activeClassName='dropzone--active'
          accept={validFileTypes()}
        >
          <AssetsTable
            assets={this.state.assets}
            orderBy={this.state.orderBy}
            isOrderAsc={this.state.isOrderAsc}
            onReorder={this.onAssetsTableReorder.bind(this)}
            context={ASSETS_TABLE_CONTEXTS.get('my-library')}
          />
        </Dropzone>
      </DocumentTitle>
    );
  }
}

LibraryAssetsList.contextTypes = {
  router: PropTypes.object
};

reactMixin(LibraryAssetsList.prototype, mixins.droppable);
reactMixin(LibraryAssetsList.prototype, Reflux.ListenerMixin);

export default LibraryAssetsList;