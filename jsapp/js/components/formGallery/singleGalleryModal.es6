import _ from 'underscore';
import React from 'react';
import Slider from 'react-slick';
import autoBind from 'react-autobind';
import reactMixin from 'react-mixin';
import Reflux from 'reflux';
import bem from '../../bem';
import ui from '../../ui';
import stores from '../../stores';
import {
  galleryActions,
  galleryStore
} from './galleryInterface';
import {
  assign,
  t
} from '../../utils';

export default class SingleGalleryModal extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      gallery: galleryStore.state.galleries[galleryStore.state.selectedGalleryIndex],
      filterGroupBy: galleryStore.state.filterGroupBy
    };
    this.slickSettings = {
      dots: false,
      fade: true,
      lazyLoad: true,
      infinite: false,
      speed: 300,
      slidesToShow: 1,
      slide: 'slide',
      slidesToScroll: 1,
      initialSlide: galleryStore.state.selectedMediaIndex,
      nextArrow: <RightNavButton />,
      prevArrow: <LeftNavButton />,
      beforeChange: this.onBeforeSliderChange
    };
    this.setSliderIndexDebounced = _.debounce(
      this.setSliderIndex,
      this.slickSettings.speed + 100
    );
  }

  componentDidMount() {
    this.listenTo(galleryStore, (storeChanges) => {
      if (storeChanges.galleries) {
        this.setState({gallery: storeChanges.galleries[galleryStore.state.selectedGalleryIndex]});
      }
      if (storeChanges.filterGroupBy) {
        this.setState({filterGroupBy: storeChanges.filterGroupBy});
      }
      if (storeChanges.selectedMediaIndex !== null) {
        this.setSliderIndexDebounced(storeChanges.selectedMediaIndex);
      }
    });
  }

  onBeforeSliderChange(prevIndex, newIndex) {
    this.setState({currentSliderIndex: newIndex});
  }

  setSliderIndex(newIndex) {
    if (newIndex !== this.state.currentSliderIndex) {
      this.refs.slider.slickGoTo(newIndex);
    }
  }

  showMoreFrom(questionName) {
    galleryActions.setFilters({filterQuery: questionName});
    stores.pageState.hideModal();
  }

  selectMedia(evt) {
    galleryActions.selectGalleryMedia({
      mediaIndex: evt.currentTarget.dataset.index
    });
  }

  renderLoadingMessage() {
    return (
      <bem.Loading>
        <bem.Loading__inner>
          <i />
          {t('Loading…')}
        </bem.Loading__inner>
      </bem.Loading>
    );
  }

  renderGallery() {
    return (
      <React.Fragment>
        <bem.SingleGalleryModal__carousel>
          <Slider ref='slider' {...this.slickSettings}>
            {this.state.gallery.medias.map(
              (media) => {
                const inlineStyle = {'backgroundImage': `url(${media.largeImage})`};
                return (
                  <bem.SingleGalleryModal__carouselImage key={media.mediaIndex}>
                    <picture
                      style={inlineStyle}
                      title={media.filename}
                    />
                  </bem.SingleGalleryModal__carouselImage>
                );
              }
            )}
          </Slider>
        </bem.SingleGalleryModal__carousel>

        {this.renderSidebar()}
      </React.Fragment>
    );
  }

  renderSidebar() {
    return (
      <bem.SingleGalleryModal__sidebar className='open'>
        <bem.SingleGalleryModal__sidebarInfo>
          <p>{t('Record')} #{galleryStore.state.selectedMediaIndex}</p>
          <h3>{this.state.gallery.title}</h3>
          <p>{this.state.gallery.dateCreated}</p>
        </bem.SingleGalleryModal__sidebarInfo>

        {this.state.gallery.medias &&
          <bem.SingleGalleryModal__sidebarGridWrap>
            <h5 onClick={() => this.showMoreFrom(this.state.gallery.title)}>
              {t('More from ##question##').replace('##question##', this.state.gallery.title)}
            </h5>

            <bem.SingleGalleryModal__sidebarGrid>
              {this.state.gallery.medias.map(
                (media) => {
                  const divStyle = {
                    backgroundImage: `url(${media.mediumImage})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    backgroundSize: 'cover'
                  };
                  return (
                    <bem.SingleGalleryModal__sidebarGridItem
                      m={galleryStore.state.selectedMediaIndex === media.mediaIndex ? 'selected' : null}
                      data-index={media.mediaIndex}
                      onClick={this.selectMedia.bind(this)}
                      key={media.mediaIndex}
                    >
                      <div className='one-one' style={divStyle} />
                    </bem.SingleGalleryModal__sidebarGridItem>
                  );
                }
              )}
            </bem.SingleGalleryModal__sidebarGrid>
          </bem.SingleGalleryModal__sidebarGridWrap>
        }
      </bem.SingleGalleryModal__sidebar>
    );
  }

  render() {
    return (
      <bem.SingleGalleryModal>
        {this.state.isLoading &&
          this.renderLoadingMessage()
        }
        {!this.state.isLoading &&
          this.renderGallery()
        }
      </bem.SingleGalleryModal>
    );
  }
};

class RightNavButton extends React.Component {
  goRight() {
    let newIndex = galleryStore.state.selectedMediaIndex + 1;
    if (newIndex >= this.props.slideCount - 1) {
      newIndex = this.props.slideCount - 1;
    }
    galleryActions.selectGalleryMedia({mediaIndex: newIndex});
  }

  render() {
    return (
      <button onClick={this.goRight.bind(this)} className={this.props.className}>
        <i className='k-icon-next' />
      </button>
    );
  }
};

class LeftNavButton extends React.Component {
  goLeft() {
    let newIndex = galleryStore.state.selectedMediaIndex - 1;
    if (newIndex < 0) {
      newIndex = 0;
    }
    galleryActions.selectGalleryMedia({mediaIndex: newIndex});
  }

  render() {
    return (
      <button onClick={this.goLeft.bind(this)} className={this.props.className}>
        <i className='k-icon-prev' />
      </button>
    );
  }
};

reactMixin(SingleGalleryModal.prototype, Reflux.ListenerMixin);
