import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ActionButton({ className, disabled, icon, onClick }) {
  return (
    <button
      type="button"
      className={classnames('btn-action', { disabled }, className)}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} color="white" />
    </button>
  );
}

ActionButton.defaultProps = {
  className: null,
  disabled: false
};

ActionButton.propTypes = {
  disabled: PropTypes.bool,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  icon: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
};
