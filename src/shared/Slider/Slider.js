import React from 'react';
import ImageGallery from 'react-image-gallery';
import axios from 'axios';

import classNames from 'classnames';

import authContext from "../../context/auth-context";
import './Slider.scss';
import Spinner from '../Spinner/Spinner';
import Notify from '../Notify/Notify';

export default class Slider extends React.Component {
  static contextType = authContext;

  constructor(props) {
    super(props);

    this.event = props.event;
    this.PREFIX_URL = `https://iran-tour-bucket.s3.eu-north-1.amazonaws.com/img/${this.event._id}/`
    this.state = {
      pending: true,
      imageBucket: [],
      upload: false,
      isSuccess: false,
      withError: false,
      file: {},
      src: '',
      images: [],
    }
  }

  componentDidMount() {
    axios.get(`${this.context.hostname}/file/image-list`, { params: { event: this.event._id } })
      .then(res => {
        const imageBucket = res.data.items
        let images = [];
        !imageBucket.length && images.push({
          thumbnail: `https://iran-tour-bucket.s3.eu-north-1.amazonaws.com/img/event1/4v.jpg`,
          original: `https://iran-tour-bucket.s3.eu-north-1.amazonaws.com/img/event1/4v.jpg`,
          embedUrl: 'https://www.youtube.com/embed/4pSzhZ76GdM?autoplay=1&showinfo=0',
          description: 'Render custom slides within the gallery',
        });
        for (let i = 0; i < imageBucket.length; i++) {
          images.push({
            original: `${this.PREFIX_URL}${imageBucket[i]}`,
            thumbnail: `${this.PREFIX_URL}${imageBucket[i]}`
          });
        }
        this.setState({ pending: false, imageBucket: res.data.items, images });
      })
      .catch(err => console.log(err));
  }

  _onImageClick(event) {
    console.log('HERE', event.target, 'at index', this._imageGallery.getCurrentIndex());
  }

  async onDelete() {
    const selectedImage = this.state.images[this._imageGallery.getCurrentIndex()]['original'];
    try {
      const res = await axios.get(`${this.context.hostname}/file/image-delete`,
        {
          params: { event: this.event._id, original: selectedImage },
          headers: {
            'Authorization': `Bearer ${document.cookie}`
          },
          withCredentials: true,
          credentials: "include"
        });
      console.log(`Image Successfully deleted: ${res}`);
      res ? this.setState({isSuccess: true}) : this.setState({withError: true})
    } catch (err) {
      console.log(err);
      this.setState({withError: true})
    }
  }

  async onChange(e) {
    const reader = new FileReader();
    this.setState({ file: e.target.files[0] }, () => { reader.readAsDataURL(this.state.file) });
    reader.addEventListener('load', (event) => {
      this.setState({ src: event.target.result });
    })
    this.setState({ upload: true });
  }

  async onSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', this.state.file);
    try {
      const upload = await axios.post(`${this.context.hostname}/file/image-upload`, formData, {
        params: {
          event: this.event._id
        },
        headers: {  
          "Accept": "multipart/form-data",
          'Content-type': 'multipart/form-data',
          'Authorization': `Bearer ${document.cookie}`
        },
        withCredentials: true,
        credentials: "include"
      })
      upload ? this.setState({isSuccess: true}) : this.setState({withError: true})
    } catch (err) {
      console.log(`error during the upload: ${err.response.data.title}`)
      this.setState({withError: true})
    }
  }
  onUpload = () => {
    this.setState({upload: false, isSuccess: false})
  }
  onError = () => {
    this.setState({withError: false, isSuccess: false})
  }
  render() {
    const { pending, upload, images } = this.state;
    return (
      <>
        {!pending ? <ImageGallery ref={i => (this._imageGallery = i)} lazyLoad={true} items={images} /> : (<Spinner style={{ margin: '34%' }} />)}
        {this.context.isAdmin  ?
          <div className="file">
            {upload ? <img src={this.state.src} className="file__img" alt=""></img> : null}
            <form onSubmit={this.onSubmit.bind(this)}>
              <label className="file__label" htmlFor="customFile"><i className={
                classNames({
                  'fa fa-file-export': !upload,
                  'fa fa-file-upload': upload
                })}></i></label>
              {!upload ? <input type="file" className="file__input" id="customFile" onChange={this.onChange.bind(this)} />
                : <input type="submit" className="file__upload" id="customFile" />}
            </form>
            <button onClick={this.onDelete.bind(this)}><i className="fa fa-trash-alt"></i></button>
            {this.state.isSuccess && <Notify text={'Image was load/delete successfully'} duration={2} onClose={this.onUpload}/>}
            {this.state.withError && <Notify error={true} text={'Loading was failed'} duration={3} onClose={this.onError}/>}
          </div> : <></>}
      </>
    );
  }

}