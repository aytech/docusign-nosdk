import React from 'react';

const Label = (props) => {
  const {
    for: htmlFor,
    text,
    hidden
  } = props;

  return (
    <label
      className={ hidden ? "hidden" : "" }
      htmlFor={ htmlFor }>
      { text }
    </label>
  );
};

export default Label;
