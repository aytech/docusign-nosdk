import React from 'react';

const Label = (props) => {
  const {
    for: htmlFor,
    text
  } = props;

  return (
    <label htmlFor={ htmlFor }>
      { text }
    </label>
  );
};

export default Label;