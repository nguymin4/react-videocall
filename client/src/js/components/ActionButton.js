import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function ActionButton({ className, disabled = false, icon, onClick }) {
  return (
    <button
      type="button"
      className={classnames('btn-action', { disabled }, className)}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} color="white" />
    </button>
  )
}

ActionButton.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,

  icon: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
}
