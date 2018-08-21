import React from 'react';
import autoBind from 'react-autobind';
import reactMixin from 'react-mixin';
import Reflux from 'reflux';
import bem from '../../bem';
import { dataInterface } from '../../dataInterface';
import stores from '../../stores';
import {galleryActions, galleryStore} from './galleryInterface';
import FormGalleryFilter from './formGalleryFilter';
import FormGalleryGrid from './formGalleryGrid';
import {
  t,
  assign,
  formatTimeDate
} from '../../utils';
import {
  MODAL_TYPES,
  GALLERY_FILTER_OPTIONS
} from '../../constants';

const DEFAULT_PAGE_SIZE = 6;

export default class FormGallery extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
    autoBind(this);
  }

  componentDidMount() {
    if (this.hasAnyMediaQuestions()) {
      galleryActions.loadGalleryData(this.props.uid);
      this.listenTo(galleryStore, (storeChanges) => {
        this.setState(storeChanges);
        if (storeChanges.filterGroupBy) {
          this.handleFilterGroupByChange(storeChanges.filterGroupBy);
        }
      });
    }
  }

  getInitialState() {
    const stateObj = {}
    assign(stateObj, galleryStore.state);
    stateObj.hasMoreRecords = false;
    stateObj.nextRecordsPage = 2;
    return stateObj;
  }

  hasAnyMediaQuestions() {
    return this.props.mediaQuestions.length !== 0;
  }

  handleFilterGroupByChange(newFilter) {
    dataInterface
      .filterGalleryImages(this.props.uid, newFilter.value, DEFAULT_PAGE_SIZE)
      .done((response) => {
        response.loaded = true;
        this.setState(this.getInitialState());
        this.forceUpdate();

        this.setState({
          galleryData: response,
          hasMoreRecords: this.state.filterGroupBy.value === GALLERY_FILTER_OPTIONS.submission.value
            ? response.next
            : this.state.hasMoreRecords //Check if more records exist!
        });
      });
  }

  // Pagination
  loadMoreAttachments(galleryIndex, galleryPage) {
    dataInterface.loadQuestionAttachment(
        this.props.uid,
        this.state.filterGroupBy.value,
        galleryIndex,
        galleryPage,
        DEFAULT_PAGE_SIZE
      )
      .done(response => {
        let galleryData = this.state.galleryData;
        galleryData.results[galleryIndex].attachments.results.push(
          ...response.attachments.results
        );
        galleryData.loaded = true;
        this.setState({ galleryData });
      });
  }

  loadMoreRecords() {
    return dataInterface.loadMoreRecords(
        this.props.uid,
        this.state.filterGroupBy.value,
        this.state.nextRecordsPage,
        DEFAULT_PAGE_SIZE
      )
      .done(response => {
        let galleryData = this.state.galleryData;
        galleryData.loaded = true;
        galleryData.results.push(...response.results);
        this.setState({
          galleryData,
          hasMoreRecords: response.next,
          nextRecordsPage: this.state.nextRecordsPage + 1
        });
      });
  }

  render() {
    if (this.state.isLoadingData) {
      return (
        <bem.AssetGallery>
          <bem.Loading>
            {this.hasAnyMediaQuestions()
              ?
              <bem.Loading__inner>
                <i />
                {t('loading...')}
              </bem.Loading__inner>
              :
              <bem.Loading__inner>
                {t('This form does not have any media questions.')}
              </bem.Loading__inner>
            }
          </bem.Loading>
        </bem.AssetGallery>
        )
    }

    if (!this.state.isLoadingData && this.hasAnyMediaQuestions()) {
      return (
        <bem.AssetGallery>
          <FormGalleryFilter/>

          {this.state.galleries.map(
            (record, i) => {
              let galleryTitle;
              if (
                this.state.filterGroupBy.value === GALLERY_FILTER_OPTIONS.question.value &&
                record.label
              ) {
                galleryTitle = record.label;
              } else {
                galleryTitle = t('Record') + ' ' + parseInt(i + 1);
              }

              let searchRegEx = new RegExp(this.state.filterQuery, 'i');
              let searchTermMatched =
                this.state.filterQuery == '' ||
                galleryTitle.match(searchRegEx) ||
                formatTimeDate(record.date_created).match(
                  this.state.filterQuery
                );
              if (searchTermMatched) {
                return (
                  <FormGalleryGrid
                    key={i}
                    uid={this.props.uid}
                    galleryTitle={galleryTitle}
                    galleryIndex={i}
                    galleryItems={record.attachments.results}
                    gallery={record}
                    totalAttachmentsCount={record.attachments.count}
                    loadMoreAttachments={this.loadMoreAttachments}
                    defaultPageSize={DEFAULT_PAGE_SIZE}
                  />
                );
              } else {
                return null;
              }
            }
          )}

          { this.state.hasMoreRecords &&
            this.state.filterGroupBy.value === GALLERY_FILTER_OPTIONS.submission.value &&
            this.state.filterQuery === '' &&
            <bem.AssetGallery__loadMore>
              <button
                onClick={this.loadMoreRecords}
                className='mdl-button mdl-button--colored'
              >
                {t('Load more')}
              </button>
            </bem.AssetGallery__loadMore>
          }
        </bem.AssetGallery>
      );
    }
  }
};

reactMixin(FormGallery.prototype, Reflux.ListenerMixin);
