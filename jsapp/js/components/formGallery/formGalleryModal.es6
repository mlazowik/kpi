import React from 'react';
import autoBind from 'react-autobind';
import Modal from 'react-modal';
import bem from '../../bem';
import ui from '../../ui';
import Slider from 'react-slick';
import { t } from '../../utils';

export class FormGalleryModal extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  componentDidUpdate() {
    if (this.refs.slider) {
      this.refs.slider.slickGoTo(this.props.galleryItemIndex);
    }
  }
  handleCarouselChange(currentIndex, newIndex) {
    this.props.changeActiveGalleryIndex(newIndex);
  }

  render() {
    const settings = {
      dots: false,
      fade: true,
      lazyLoad: true,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slide: 'slide',
      slidesToScroll: 1,
      initialSlide: this.props.galleryItemIndex,
      nextArrow: <RightNavButton />,
      prevArrow: <LeftNavButton />
    };

    return (
      <Modal isOpen contentLabel='Modal'>
        <bem.AssetGallery__modal>
          <ui.Modal.Body>

            <bem.AssetGallery__modalCarousel className='col8'>
              <Slider
                ref='slider'
                {...settings}
                beforeChange={this.handleCarouselChange}
              >
                {this.props.activeGalleryAttachments.map(
                  function(item, i) {
                    return (
                      <div key={i}>
                        <img
                          alt={this.props.galleryTitle}
                          src={item.large_download_url}
                        />
                      </div>
                    );
                  }.bind(this)
                )}
              </Slider>
            </bem.AssetGallery__modalCarousel>

            <FormGalleryModalSidebar
              activeGalleryAttachments={this.props.activeGalleryAttachments}
              filter={this.props.filter}
              galleryItemIndex={this.props.galleryItemIndex}
              galleryTitle={this.props.galleryTitle}
              galleryIndex={this.props.activeGallery.index}
              date={this.props.galleryDate}
              changeActiveGalleryIndex={this.props.changeActiveGalleryIndex}
              closeModal={this.props.closeModal}
              setSearchTerm={this.props.setSearchTerm}
            />

          </ui.Modal.Body>
        </bem.AssetGallery__modal>
      </Modal>
    );
  }
};

export class FormGalleryModalSidebar extends React.Component {
  goToFilter(gridLabel) {
    this.props.closeModal();
    this.props.setSearchTerm(gridLabel);
  }
  render() {
    let currentRecordIndex = this.props.filter === 'question'
      ? this.props.galleryItemIndex + 1
      : this.props.galleryIndex + 1;
    let featuredItems = this.props.activeGalleryAttachments.slice();
    featuredItems.splice(this.props.galleryItemIndex, 1);
    return (
      <bem.AssetGallery__modalSidebar className='col4 open'>
        <i className='toggle-info k-icon-close' onClick={this.props.closeModal} />
        <bem.AssetGallery__modalSidebarInfo>
            <p>{t('Record')} #{currentRecordIndex}</p>
            <h3>{this.props.galleryTitle}</h3>
            <p>{this.props.date}</p>
        </bem.AssetGallery__modalSidebarInfo>

        {this.props.activeGalleryAttachments != undefined &&
          <bem.AssetGallery__modalSidebarGridWrap>
            <h5 onClick={() => this.goToFilter(this.props.galleryTitle)}>
              {t('More for') + ' ' + this.props.galleryTitle}
            </h5>
            <bem.AssetGallery__modalSidebarGrid>
              {featuredItems.filter((j, index) => index < 6).map(
                function(item, j) {
                  var divStyle = {
                    backgroundImage: 'url(' +
                      item.medium_download_url +
                      ')',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    backgroundSize: 'cover'
                  };
                  return (
                    <bem.AssetGallery__modalSidebarGridItem
                      key={j}
                      className='col6'
                      onClick={() => this.props.changeActiveGalleryIndex(j)}
                    >
                      <div className='one-one' style={divStyle} />
                    </bem.AssetGallery__modalSidebarGridItem>
                  );
                }.bind(this)
              )}
            </bem.AssetGallery__modalSidebarGrid>
          </bem.AssetGallery__modalSidebarGridWrap>
        }
      </bem.AssetGallery__modalSidebar>
    );
  }
};

export class RightNavButton extends React.Component {
  render() {
    const { className, onClick } = this.props;
    return (
      <button onClick={onClick} className={className}>
        <i className='k-icon-next' />
      </button>
    );
  }
};

export class LeftNavButton extends React.Component {
  render() {
    const { className, onClick } = this.props;
    return (
      <button onClick={onClick} className={className}>
        <i className='k-icon-prev' />
      </button>
    );
  }
};

module.exports = FormGalleryModal;