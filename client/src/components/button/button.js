import React from 'react';
import './button.css';

const Button = (props) => {

  const { loading, disabled } = props;
  let content;

  if (loading === true) {
    content = (
      <div className="fa-sm">
        <i className="fas fa-sync fa-spin"/>
        Submit
      </div>
    );
  } else {
    content = 'Submit';
  }

  return (
    <button
      type="submit"
      className="btn btn-primary btn-block"
      disabled={ disabled === true }>
      { content }
    </button>
  );
};

export default Button;