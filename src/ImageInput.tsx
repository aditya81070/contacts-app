import React, { CSSProperties } from "react";
import PropTypes from "prop-types";

const readFileAsDataURL = (file: File) =>
  new Promise(resolve => {
    const reader = new FileReader();

    reader.onload = event => {
      resolve(event.target!.result);
    };

    reader.readAsDataURL(file);
  });

const resizeImage = (
  imageURL: string,
  canvas: HTMLCanvasElement,
  maxHeight: number
) =>
  new Promise(resolve => {
    const image = new Image();

    image.onload = () => {
      const context = canvas.getContext("2d");

      if (image.height > maxHeight) {
        image.width *= maxHeight / image.height;
        image.height = maxHeight;
      }

      context!.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = image.width;
      canvas.height = image.height;

      context!.drawImage(image, 0, 0, image.width, image.height);

      resolve(canvas.toDataURL("image/jpeg"));
    };

    image.src = imageURL;
  });

/**
 * A custom <input> that dynamically reads and resizes image files before
 * submitting them to the server as data URLs. Also, shows a preview of the image.
 */
export interface ImageInputProps {
  className?: string;
  name: string;
  maxHeight: number;
}

export interface ImageInputState {
  value: string;
}
class ImageInput extends React.Component<ImageInputProps, ImageInputState> {
  static propTypes = {
    className: PropTypes.string,
    name: PropTypes.string,
    maxHeight: PropTypes.number
  };

  state = {
    value: ""
  };

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];

    if (file && file.type.match(/^image\//)) {
      readFileAsDataURL(file).then(originalURL => {
        resizeImage(
          originalURL as string,
          this.canvas,
          this.props.maxHeight
        ).then(url => {
          this.setState({ value: url as string });
        });
      });
    } else {
      this.setState({ value: "" });
    }
  };

  handleFormReset = () => {
    this.setState({ value: "" });
  };
  fileInput!: HTMLInputElement | null;
  canvas!: HTMLCanvasElement;

  componentDidMount() {
    this.canvas = document.createElement("canvas");
    this.fileInput!.form!.addEventListener("reset", this.handleFormReset);
  }

  componentWillUnmount() {
    this.fileInput!.form!.removeEventListener("reset", this.handleFormReset);
  }

  render() {
    const { className, name } = this.props;
    const { value } = this.state;

    const style: CSSProperties = {
      position: "relative"
    };

    if (value) {
      style.backgroundImage = `url("${value}")`;
      style.backgroundRepeat = "no-repeat";
      style.backgroundPosition = "center";
      style.backgroundSize = "cover";
    }

    return (
      <div className={className} style={style}>
        <input type="hidden" name={name} value={value} />
        <input
          ref={node => (this.fileInput = node)}
          type="file"
          onChange={this.handleFileChange}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0
          }}
        />
      </div>
    );
  }
}

export default ImageInput;
