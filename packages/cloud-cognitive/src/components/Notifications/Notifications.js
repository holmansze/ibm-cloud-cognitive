/**
 * Copyright IBM Corp. 2020, 2021
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Import portions of React that are needed.
import React, { useEffect, useState, useRef } from 'react';

// Other standard imports.
import PropTypes from 'prop-types';
import cx from 'classnames';
import { pkg } from '../../settings';
import { timeAgo } from './utils';
import { NotificationsEmptyState } from '../EmptyStates/NotificationsEmptyState';
import useClickOutside from './useClickOutside';

// Carbon and package components we use.
import { Button, Link, Toggle } from 'carbon-components-react';
import {
  ErrorFilled16,
  WarningAltFilled16,
  CheckmarkFilled16,
  InformationSquareFilled16,
  ChevronDown16,
  Close16,
  Settings16,
} from '@carbon/icons-react';

// The block part of our conventional BEM class names (blockClass__E--M).
const componentName = 'Notifications';
const blockClass = `${pkg.prefix}--notifications-panel`;

export let Notifications = React.forwardRef(
  (
    {
      className,
      data,
      dismissAllLabel,
      doNotDisturbLabel,
      daysAgoLabel,
      emptyStateLabel,
      hoursAgoLabel,
      hourAgoLabel,
      minuteAgoLabel,
      minutesAgoLabel,
      monthsAgoLabel,
      monthAgoLabel,
      nowLabel,
      onDismissAllNotifications,
      onDismissSingleNotification,
      onDoNotDisturbChange,
      onSettingsClick,
      onViewAllClick,
      open,
      previousLabel,
      readLessLabel,
      readMoreLabel,
      secondsAgoLabel,
      setOpen,
      title,
      todayLabel,
      yearsAgoLabel,
      yearAgoLabel,
      yesterdayAtLabel,
      yesterdayLabel,
      ...rest
    },
    ref
  ) => {
    const notificationPanelRef = useRef();
    const [shouldRender, setRender] = useState(open);
    const [allNotifications, setAllNotifications] = useState([]);

    useClickOutside(notificationPanelRef, () => {
      setOpen(!open);
    });

    useEffect(() => {
      // Set the notifications passed to the state within this component
      setAllNotifications(data);
    }, [data]);

    useEffect(() => {
      // initialize the notification panel to open
      if (open) setRender(true);
    }, [open]);

    const onAnimationEnd = () => {
      // initialize the notification panel to close
      if (!open) setRender(false);
    };

    // Notifications should be grouped by "Today", "Yesterday", and "Previous", the variables
    // below filter the notifications based on those conditions and then render them in those groups
    let yesterdayDate = new Date();
    yesterdayDate = new Date(
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    );
    let dayBeforeYesterdayDate = new Date();
    dayBeforeYesterdayDate = new Date(
      dayBeforeYesterdayDate.setDate(dayBeforeYesterdayDate.getDate() - 2)
    );
    const withinLastDayNotifications =
      allNotifications &&
      allNotifications.length &&
      allNotifications.filter(
        (item) => item.timestamp.getTime() >= yesterdayDate.getTime()
      );
    const previousDayNotifications =
      allNotifications &&
      allNotifications.length &&
      allNotifications.filter(
        (item) =>
          item.timestamp.getTime() < yesterdayDate.getTime() &&
          item.timestamp.getTime() >= dayBeforeYesterdayDate.getTime()
      );
    const previousNotifications =
      allNotifications &&
      allNotifications.length &&
      allNotifications.filter(
        (item) => item.timestamp.getTime() < dayBeforeYesterdayDate.getTime()
      );

    const renderDescription = (id) => {
      const notification =
        allNotifications &&
        allNotifications.length &&
        allNotifications.filter((item) => item.id === id)[0];
      const trimLength = 88;
      const description = notification.description;
      const descriptionClassName = cx([
        `${blockClass}__notification-description`,
        {
          [`${blockClass}__notification-long-description`]: notification.showAll,
          [`${blockClass}__notification-short-description`]: !notification.showAll,
        },
      ]);
      const showMoreButtonClassName = cx([
        {
          [`${blockClass}__notification-read-less-button`]: notification.showAll,
          [`${blockClass}__notification-read-more-button`]: !notification.showAll,
        },
      ]);
      return (
        <div>
          <p className={descriptionClassName}>{description}</p>
          {description.length > trimLength && (
            <Button
              kind="ghost"
              size="small"
              renderIcon={ChevronDown16}
              iconDescription={
                notification.showAll ? readLessLabel : readMoreLabel
              }
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const newData = allNotifications.map((item) => {
                  if (item.id === notification.id)
                    return Object.assign({}, item, {
                      showAll: !item.showAll,
                    });
                  return item;
                });
                setAllNotifications(newData);
              }}
              className={showMoreButtonClassName}>
              {notification.showAll ? 'Read less' : 'Read more'}
            </Button>
          )}
        </div>
      );
    };

    const renderNotification = (group, notification, index) => {
      const notificationClassName = cx([
        `${blockClass}__notification`,
        `${blockClass}__notification-${group}`,
      ]);
      const notificationHeaderClassName = cx([
        `${blockClass}__notification-title`,
        {
          [`${blockClass}__notification-title-unread`]: notification.unread,
        },
      ]);
      return (
        <div
          aria-label={`Notification: ${notification.title}`}
          key={`${notification.timestamp}-${notification.title}-${index}`}
          className={notificationClassName}
          type="button"
          role="button"
          tabIndex={0}
          onClick={() => notification.onNotificationClick(notification)}
          onKeyDown={(event) => {
            if (
              event.target.classList.contains(
                `${blockClass}__dismiss-single-button`
              )
            )
              return;
            if (event.which === 13) {
              notification.onNotificationClick(notification);
            }
          }}>
          {notification.type === 'error' && (
            <ErrorFilled16
              className={cx([
                `${blockClass}__notification-status-icon`,
                `${blockClass}__notification-status-icon-error`,
              ])}
            />
          )}
          {notification.type === 'success' && (
            <CheckmarkFilled16
              className={cx([
                `${blockClass}__notification-status-icon`,
                `${blockClass}__notification-status-icon-success`,
              ])}
            />
          )}
          {notification.type === 'warning' && (
            <WarningAltFilled16
              className={cx([
                `${blockClass}__notification-status-icon`,
                `${blockClass}__notification-status-icon-warning`,
              ])}
            />
          )}
          {notification.type === 'informational' && (
            <InformationSquareFilled16
              className={cx([
                `${blockClass}__notification-status-icon`,
                `${blockClass}__notification-status-icon-informational`,
              ])}
            />
          )}
          <div className={`${blockClass}__notification-content`}>
            <p className={`${blockClass}__notification-time-label`}>
              {timeAgo({
                previousTime: notification.timestamp,
                secondsAgoLabel,
                minuteAgoLabel,
                minutesAgoLabel,
                hoursAgoLabel,
                hourAgoLabel,
                daysAgoLabel,
                yesterdayAtLabel,
                monthsAgoLabel,
                monthAgoLabel,
                yearsAgoLabel,
                yearAgoLabel,
                nowLabel,
              })}
            </p>
            <h6 className={notificationHeaderClassName}>
              {notification.title}
            </h6>
            {notification.description &&
              notification.description.length &&
              renderDescription(notification.id)}
            {notification.link &&
              notification.link.text &&
              notification.link.url && (
                <Link
                  href={notification.link.url}
                  className={`${blockClass}__notifications-link`}>
                  {notification.link.text}
                </Link>
              )}
          </div>
          <Button
            kind="ghost"
            size="small"
            renderIcon={Close16}
            iconDescription="Dismiss"
            tooltipPosition="left"
            className={`${blockClass}__dismiss-single-button`}
            onClick={(event) => dismissSingleNotification(event, notification)}
          />
        </div>
      );
    };

    const dismissSingleNotification = (event, notification) => {
      event.preventDefault();
      event.stopPropagation();
      onDismissSingleNotification(notification);
    };

    const mainSectionClassName = cx([
      `${blockClass}__main-section`,
      {
        [`${blockClass}__main-section-empty`]:
          allNotifications && !allNotifications.length,
      },
    ]);

    return shouldRender ? (
      <div
        {
          // Pass through any other property values as HTML attributes.
          ...rest
        }
        id={blockClass}
        className={cx([`${blockClass}__container`], {
          [className]: className,
        })}
        style={{ animation: `${open ? 'fadeIn 250ms' : 'fadeOut 250ms'}` }}
        onAnimationEnd={onAnimationEnd}
        ref={ref || notificationPanelRef}>
        <div className={`${blockClass}__header-container`}>
          <div className={`${blockClass}__header-flex`}>
            <h1 className={`${blockClass}__header`}>{title}</h1>
            <Button
              size="small"
              kind="ghost"
              className={`${blockClass}__dismiss-button`}
              onClick={() => onDismissAllNotifications()}>
              {dismissAllLabel}
            </Button>
          </div>
          <Toggle
            size="sm"
            className={`${blockClass}__do-not-disturb-toggle`}
            id={`${blockClass}__do-not-disturb-toggle-component`}
            labelA={doNotDisturbLabel}
            labelB={doNotDisturbLabel}
            onToggle={(event) => onDoNotDisturbChange(event)}
            aria-label={doNotDisturbLabel}
          />
        </div>
        <div className={mainSectionClassName}>
          {withinLastDayNotifications && withinLastDayNotifications.length ? (
            <>
              <h6 className={`${blockClass}__time-section-label`}>
                {todayLabel}
              </h6>
              {withinLastDayNotifications.map((notification, index) =>
                renderNotification('today', notification, index)
              )}
            </>
          ) : null}
          {previousDayNotifications && previousDayNotifications.length ? (
            <>
              <h6 className={`${blockClass}__time-section-label`}>
                {yesterdayLabel}
              </h6>
              {previousDayNotifications.map((notification, index) =>
                renderNotification('yesterday', notification, index)
              )}
            </>
          ) : null}
          {previousNotifications && previousNotifications.length ? (
            <>
              <h6 className={`${blockClass}__time-section-label`}>
                {previousLabel}
              </h6>
              {previousNotifications.map((notification, index) =>
                renderNotification('previous', notification, index)
              )}
            </>
          ) : null}
          {!allNotifications.length && (
            <NotificationsEmptyState
              illustrationTheme="dark"
              heading=""
              subtext={emptyStateLabel}
            />
          )}
        </div>
        {onViewAllClick &&
        onSettingsClick &&
        allNotifications &&
        allNotifications.length ? (
          <div className={`${blockClass}__bottom-actions`}>
            <Button
              kind="ghost"
              className={`${blockClass}__view-all-button`}
              onClick={() => onViewAllClick()}>
              View all ({allNotifications.length})
            </Button>
            <Button
              kind="ghost"
              size="small"
              className={`${blockClass}__settings-button`}
              renderIcon={Settings16}
              iconDescription="Settings"
              onClick={() => onSettingsClick()}
            />
          </div>
        ) : null}
      </div>
    ) : null;
  }
);

// Return a placeholder if not released and not enabled by feature flag
Notifications = pkg.checkComponentEnabled(Notifications, componentName);

// The display name of the component, used by React. Note that displayName
// is used in preference to relying on function.name.
Notifications.displayName = componentName;

// The types and DocGen commentary for the component props,
// in alphabetical order (for consistency).
// See https://www.npmjs.com/package/prop-types#usage.
Notifications.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node.
   */
  className: PropTypes.string,

  /**
   * Array of data for Notifications component to render
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      type: PropTypes.oneOf(['error', 'warning', 'success', 'informational']),
      timestamp: PropTypes.instanceOf(Date),
      title: PropTypes.string,
      description: PropTypes.string,
      link: PropTypes.shape({
        url: PropTypes.string,
        text: PropTypes.string,
      }),
      unread: PropTypes.bool,
      onNotificationClick: PropTypes.func,
    })
  ).isRequired,

  /**
   * Sets the `days ago` label text
   */
  daysAgoLabel: PropTypes.string,

  /**
   * Label for Dismiss all button
   */
  dismissAllLabel: PropTypes.string,

  /**
   * Label for Do not disturb toggle
   */
  doNotDisturbLabel: PropTypes.string,

  /**
   * Sets the empty state label text when there are no notifications
   */
  emptyStateLabel: PropTypes.string,

  /**
   * Sets the `hour ago` label text
   */
  hourAgoLabel: PropTypes.string,

  /**
   * Sets the `hours ago` label text
   */
  hoursAgoLabel: PropTypes.string,

  /**
   * Sets the `minute ago` label text
   */
  minuteAgoLabel: PropTypes.string,

  /**
   * Sets the `minutes ago` label text
   */
  minutesAgoLabel: PropTypes.string,

  /**
   * Sets the `month ago` label text
   */
  monthAgoLabel: PropTypes.string,

  /**
   * Sets the `months ago` label text
   */
  monthsAgoLabel: PropTypes.string,

  /**
   * Sets the `now` label text
   */
  nowLabel: PropTypes.string,

  /**
   * Function that will dismiss all notifications
   */
  onDismissAllNotifications: PropTypes.func.isRequired,

  /**
   * Function that will dismiss a single notification
   */
  onDismissSingleNotification: PropTypes.func.isRequired,

  /**
   * Function that returns the current selected value of the disable notification toggle
   */
  onDoNotDisturbChange: PropTypes.func,

  /**
   * Event handler for the View all button
   */
  onSettingsClick: PropTypes.func,

  /**
   * Event handler for the View all button
   */
  onViewAllClick: PropTypes.func,

  /**
   * Determines whether the notifications panel should render or not
   */
  open: PropTypes.bool.isRequired,

  /**
   * Sets the previous label text
   */
  previousLabel: PropTypes.string,

  /**
   * Sets the `read less` label text
   */
  readLessLabel: PropTypes.string,

  /**
   * Sets the `read more` label text
   */
  readMoreLabel: PropTypes.string,

  /**
   * Sets the `seconds ago` label text
   */
  secondsAgoLabel: PropTypes.string,

  /**
   * Sets the notifications panel open state
   */
  setOpen: PropTypes.func.isRequired,

  /**
   * Sets the title for the Notifications panel
   */
  title: PropTypes.string,

  /**
   * Sets the today label text
   */
  todayLabel: PropTypes.string,

  /**
   * Sets the `year ago` label text
   */
  yearAgoLabel: PropTypes.string,

  /**
   * Sets the `years ago` label text
   */
  yearsAgoLabel: PropTypes.string,

  /**
   * Sets the `Yesterday at` label text
   */
  yesterdayAtLabel: PropTypes.string,

  /**
   * Sets the yesterday label text
   */
  yesterdayLabel: PropTypes.string,
};

// Default values for component props. Default values are not required for
// props that are required, nor for props where the component can apply
// 'undefined' values reasonably. Default values should be provided when the
// component needs to make a choice or assumption when a prop is not supplied.
Notifications.defaultProps = {
  doNotDisturbLabel: 'Do not disturb',
  dismissAllLabel: 'Dismiss all',
  previousLabel: 'Previous',
  title: 'Notifications',
  todayLabel: 'Today',
  yesterdayLabel: 'Yesterday',
  onDismissAllNotifications: () => {},
  onDismissSingleNotification: () => {},
  secondsAgoLabel: 'seconds ago',
  minuteAgoLabel: 'minute ago',
  minutesAgoLabel: 'minutes ago',
  hoursAgoLabel: 'hours ago',
  hourAgoLabel: 'hour ago',
  daysAgoLabel: 'days ago',
  yesterdayAtLabel: 'Yesterday at',
  monthsAgoLabel: 'months ago',
  monthAgoLabel: 'month ago',
  yearsAgoLabel: 'years ago',
  yearAgoLabel: 'year ago',
  nowLabel: 'Now',
  emptyStateLabel: 'You do not have any notifications',
  readLessLabel: 'Read less',
  readMoreLabel: 'Read more',
};