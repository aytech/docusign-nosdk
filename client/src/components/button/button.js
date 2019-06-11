import React from 'react';
import './button.css';

const Button = (props) => {

  const { loading, disabled, type, text, onClick } = props;
  let style = "btn btn-block";
  let content;

  if (type === "primary") {
    style += " btn-primary";
  } else {
    style += " btn-default";
  }

  if (loading === true) {
    content = (
      <div className="fa-sm">
        <i className="fas fa-sync fa-spin"/>
        { text }
      </div>
    );
  } else {
    content = text;
  }

  return (
    <button
      onClick={ onClick }
      type="submit"
      className={ style }
      disabled={ disabled === true }>
      { content }
    </button>
  );
};

export default Button;
