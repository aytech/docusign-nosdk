import React from 'react';
import PropTypes from 'prop-types';
import './modal.css';

class Modal extends React.Component {
  render() {
    // Render nothing if the "show" prop is false
    if (!this.props.show) {
      return null;
    }

    const {
      onClose,
      header,
      children,
      iframe
    } = this.props;

    const modalClass = iframe ? 'modal-container iframe' : 'modal-container';

    return (
      <div className="backdrop">
        <div className={ modalClass }>
          <div className="modal-header">
            <h2>{ header }</h2>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={ onClose }>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            { children }
          </div>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node
};

export default Modal;
