import React from 'react';
import './button.css';

const Button = (props) => {

  const { loading, disabled, type, onClick } = props;
  let style = "btn btn-block";
  let content;

  switch (type) {
    case "primary":
      style += " btn-primary";
      break;
    default:
      style += " btn-default";
  }

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
      onClick={ onClick }
      type="submit"
      className={ style }
      disabled={ disabled === true }>
      { content }
    </button>
  );
};

export default Button;
